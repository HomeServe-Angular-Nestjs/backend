import { randomUUID } from 'crypto';
import { Inject, UseFilters } from '@nestjs/common';
import { BaseSocketGateway, corsOption } from '@modules/websockets/namespaces/base.gateway';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';

import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  CallAcceptDto,
  CallDeclineDto,
  CallJoinDto,
  CallLeaveDto,
  CallReceiverDto,
  SignalPayloadDto,
} from '@modules/websockets/dto/video-call.dto';
import { CUSTOM_DTO_VALIDATOR_NAME } from '@core/constants/utility.constant';
import { ICustomDtoValidator } from '@core/utilities/interface/custom-dto-validator.utility.interface';
import { AUTH_SOCKET_SERVICE_NAME, USER_SOCKET_STORE_SERVICE_NAME, VIDEO_CALL_SERVICE_NAME } from '@core/constants/service.constant';
import { IVideoCallService } from '@modules/websockets/services/interface/video-call-service.interface';
import { GlobalWsExceptionFilter } from '@core/exception-filters/ws-exception.filters';
import { IAuthSocketService } from '@modules/websockets/services/interface/auth-socket-service.interface';
import { IUserSocketStoreService } from '@modules/websockets/services/interface/user-socket-store-service.interface';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { BOOKING_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { CallEndReason, CallStatus } from '@core/enum/call.enum';
import { ICallSession } from '@core/entities/interfaces/call-session.interface';

const namespace = 'video-call';

const VIDEO_CALL_INITIATE = 'video-call:initiate';
const VIDEO_CALL_ACCEPT = 'video-call:accept';
const VIDEO_CALL_DECLINE = 'video-call:decline';
const VIDEO_CALL_LEAVE = 'video-call:leave';
const VIDEO_CALL_JOIN = 'video-call:join';
const SIGNAL = 'video-call:signal';

const VIDEO_CALL_INITIATED = 'video-call:initiated';
const VIDEO_CALL_RINGING = 'video-call:ringing';
const VIDEO_CALL_ACCEPTED = 'video-call:accepted';
const VIDEO_CALL_ENDED = 'video-call:ended';
const VIDEO_CALL_PEER_RECONNECTING = 'video-call:peer-reconnecting';
const VIDEO_CALL_REJOINED = 'video-call:rejoined';
const VIDEO_CALL_UNAVAILABLE = 'video-call:unavailable';

const RINGING_TIMEOUT_MS = 30_000;
const RINGING_SESSION_TTL_S = 90;
const ACTIVE_CALL_TTL_S = 3600;
const RECONNECT_GRACE_MS = 8_000;

@UseFilters(GlobalWsExceptionFilter)
@WebSocketGateway({ cors: corsOption, namespace })
export class VideoCallGateway extends BaseSocketGateway {
  @WebSocketServer()
  private server: Server;

  private readonly _reconnectGrace = new Map<string, NodeJS.Timeout>();

  constructor(
    @Inject(LOGGER_FACTORY)
    loggerFactory: ILoggerFactory,
    @Inject(AUTH_SOCKET_SERVICE_NAME)
    authSocketService: IAuthSocketService,
    @Inject(USER_SOCKET_STORE_SERVICE_NAME)
    userSocketService: IUserSocketStoreService,
    @Inject(CUSTOM_DTO_VALIDATOR_NAME)
    private readonly _customDtoValidatorUtility: ICustomDtoValidator,
    @Inject(VIDEO_CALL_SERVICE_NAME)
    private readonly _videoCallService: IVideoCallService,
    @Inject(BOOKING_REPOSITORY_NAME)
    private readonly _bookingRepository: IBookingRepository,
  ) {
    super(loggerFactory, authSocketService, userSocketService, namespace, true);
  }

  protected override async onClientConnect(client: Socket): Promise<void> {
    await this._authenticate(client);
  }

  protected override async onClientDisConnect(client: Socket): Promise<void> {
    this.logger.debug(`Client disconnected: ${client.id}`);

    await this._unauthenticate(client);

    const user = client.data?.user;
    if (!user?.id) return;

    const callId = await this._videoCallService.getActiveCallId(user.id);
    if (!callId) return;

    const session = await this._videoCallService.getSession(callId);
    if (!session) return;

    if (session.status === CallStatus.RINGING) {
      const reason = session.callerId === user.id ? CallEndReason.CANCELLED : CallEndReason.MISSED;
      await this._finalizeSession(session, reason);
      return;
    }

    if (session.status === CallStatus.ACTIVE || session.status === CallStatus.CONNECTING || session.status === CallStatus.RECONNECTING) {
      await this._videoCallService.updateStatus(callId, CallStatus.RECONNECTING);
      this.server.to(this._callRoom(callId)).emit(VIDEO_CALL_PEER_RECONNECTING, { callId });
      this._scheduleReconnectGrace(callId, () => void this._handleReconnectTimeout(callId));
    }
  }

  @SubscribeMessage(VIDEO_CALL_INITIATE)
  async handleCallInitiate(@ConnectedSocket() client: Socket, @MessageBody() body: CallReceiverDto) {
    try {
      await this._customDtoValidatorUtility.validateDto(CallReceiverDto, body);
    } catch (err) {
      this.logger.error(`validateDto failed: ${err.message}`);
      throw err;
    }

    const user = this._getClient(client);
    if (!user?.id) {
      client.emit(VIDEO_CALL_UNAVAILABLE, { message: 'Unauthorized' });
      return;
    }

    const { callee } = body;

    // Enforce active booking validation (unchanged)
    const customerId = user.type === 'customer' ? user.id : callee;
    const providerId = user.type === 'provider' ? user.id : callee;

    let isOngoing: boolean;
    try {
      isOngoing = await this._bookingRepository.isAnyBookingOngoing(customerId, providerId);
    } catch (err) {
      this.logger.error(`isAnyBookingOngoing threw: ${err.message}`);
      client.emit(VIDEO_CALL_UNAVAILABLE, { message: 'Booking check failed' });
      return;
    }

    if (!isOngoing) {
      client.emit(VIDEO_CALL_UNAVAILABLE, { message: 'No active booking found with this user' });
      return;
    }

    // Caller already in a call (including another tab)?
    const callerCallId = await this._videoCallService.getActiveCallId(user.id);
    if (callerCallId) {
      client.emit(VIDEO_CALL_UNAVAILABLE, { message: 'You are already in another call' });
      return;
    }

    // Callee already in a call?
    const calleeCallId = await this._videoCallService.getActiveCallId(callee);
    if (calleeCallId) {
      client.emit(VIDEO_CALL_UNAVAILABLE, { message: 'User is currently busy' });
      return;
    }

    // Callee online?
    const isOnline = await this._userSocketService.hasSockets(callee, namespace);
    if (!isOnline) {
      client.emit(VIDEO_CALL_UNAVAILABLE, { message: 'User is offline' });
      return;
    }

    const callId = randomUUID();
    const session = await this._videoCallService.createSession(callId, user.id, callee, client.id, RINGING_SESSION_TTL_S);
    await client.join(this._callRoom(callId));

    client.emit(VIDEO_CALL_INITIATED, { callId, expiresAt: session.expiresAt });
    this.server.to(this._roomKey(callee)).emit(VIDEO_CALL_RINGING, { callId, callerId: user.id });

    this.logger.log(`Call ${callId} initiated by ${user.id} → ${callee}`);

    this._videoCallService.scheduleTimeout(callId, RINGING_TIMEOUT_MS, (cid) => void this._handleRingTimeout(cid));
  }

  @SubscribeMessage(VIDEO_CALL_ACCEPT)
  async handleCallAccept(@ConnectedSocket() client: Socket, @MessageBody() body: CallAcceptDto) {
    await this._customDtoValidatorUtility.validateDto(CallAcceptDto, body);
    const user = this._getClient(client);
    if (!user?.id) return;

    const { callId } = body;
    const session = await this._videoCallService.getSession(callId);
    if (!session) {
      client.emit(VIDEO_CALL_UNAVAILABLE, { message: 'Call no longer exists' });
      return;
    }
    if (session.receiverId !== user.id) {
      client.emit(VIDEO_CALL_UNAVAILABLE, { message: 'You are not the callee for this call' });
      return;
    }
    if (session.status !== CallStatus.RINGING) {
      client.emit(VIDEO_CALL_UNAVAILABLE, { message: 'Call is no longer active' });
      return;
    }

    await this._videoCallService.setReceiverSocket(callId, client.id);
    await this._videoCallService.updateStatus(callId, CallStatus.ACTIVE, ACTIVE_CALL_TTL_S);
    await client.join(this._callRoom(callId));
    this._videoCallService.clearTimeout(callId);

    // Close the incoming dialog on the callee's other sockets (multi-tab)
    const calleeSockets = await this._userSocketService.getSockets(user.id, namespace);
    for (const socketId of calleeSockets) {
      if (socketId !== client.id) {
        this.server.to(socketId).emit(VIDEO_CALL_ENDED, { callId, reason: CallEndReason.ACCEPTED_ELSEWHERE });
      }
    }

    this.server.to(this._callRoom(callId)).emit(VIDEO_CALL_ACCEPTED, {
      callId,
      calleeId: user.id,
      calleeType: user.type,
    });

    this.logger.log(`Call ${callId} accepted by ${user.id}`);
  }

  @SubscribeMessage(VIDEO_CALL_DECLINE)
  async handleCallDecline(@ConnectedSocket() client: Socket, @MessageBody() body: CallDeclineDto) {
    await this._customDtoValidatorUtility.validateDto(CallDeclineDto, body);
    const user = this._getClient(client);
    if (!user?.id) return;

    const { callId } = body;
    const session = await this._videoCallService.getSession(callId);
    if (!session) return;
    if (session.receiverId !== user.id) return;
    if (session.status !== CallStatus.RINGING) return;

    await this._finalizeSession(session, CallEndReason.DECLINED);
  }

  @SubscribeMessage(VIDEO_CALL_LEAVE)
  async handleCallLeave(@ConnectedSocket() client: Socket, @MessageBody() body: CallLeaveDto) {
    await this._customDtoValidatorUtility.validateDto(CallLeaveDto, body);
    const user = this._getClient(client);
    if (!user?.id) return;

    const { callId } = body;
    const session = await this._videoCallService.getSession(callId);
    if (!session) return;
    if (!this._isParticipant(session, user.id, client.id)) return;

    const reason =
      session.status === CallStatus.RINGING
        ? session.callerId === user.id
          ? CallEndReason.CANCELLED
          : CallEndReason.DECLINED
        : CallEndReason.REMOTE_LEFT;

    await this._finalizeSession(session, reason);
  }

  @SubscribeMessage(VIDEO_CALL_JOIN)
  async handleCallJoin(@ConnectedSocket() client: Socket, @MessageBody() body: CallJoinDto) {
    await this._customDtoValidatorUtility.validateDto(CallJoinDto, body);
    const user = this._getClient(client);
    if (!user?.id) return;

    const { callId } = body;
    const session = await this._videoCallService.getSession(callId);
    if (!session) {
      client.emit(VIDEO_CALL_ENDED, { callId, reason: CallEndReason.REMOTE_LEFT });
      return;
    }
    if (session.callerId !== user.id && session.receiverId !== user.id) return;
    if (session.status !== CallStatus.ACTIVE && session.status !== CallStatus.CONNECTING && session.status !== CallStatus.RECONNECTING) {
      return;
    }

    await this._videoCallService.setSocketForUser(callId, user.id, client.id);
    await client.join(this._callRoom(callId));
    this._clearReconnectGrace(callId);

    if (session.status === CallStatus.RECONNECTING) {
      await this._videoCallService.updateStatus(callId, CallStatus.ACTIVE, ACTIVE_CALL_TTL_S);
    }

    client.to(this._callRoom(callId)).emit(VIDEO_CALL_REJOINED, { callId, socketId: client.id });
    this.logger.log(`Call ${callId} rejoined by ${user.id}`);
  }

  @SubscribeMessage(SIGNAL)
  async handleSignal(@ConnectedSocket() client: Socket, @MessageBody() data: SignalPayloadDto) {
    await this._customDtoValidatorUtility.validateDto(SignalPayloadDto, data);
    const user = this._getClient(client);

    const { callId, type, offer, answer, candidate } = data;
    const session = await this._videoCallService.getSession(callId);

    // Reject signaling without a valid, live session and a participant sender.
    if (!session) return;
    if (
      session.status !== CallStatus.RINGING &&
      session.status !== CallStatus.CONNECTING &&
      session.status !== CallStatus.ACTIVE &&
      session.status !== CallStatus.RECONNECTING
    ) {
      return;
    }
    if (!this._isParticipant(session, user?.id, client.id)) return;

    client.to(this._callRoom(callId)).emit(SIGNAL, {
      callId,
      type,
      offer,
      answer,
      candidate,
      from: client.id,
    });
  }

  /* ============================== Internals ============================== */

  private _callRoom(callId: string): string {
    return `call:${callId}`;
  }

  private _isParticipant(session: ICallSession, userId: string | undefined, socketId: string): boolean {
    if (!userId) return false;
    return (
      (session.callerId === userId && session.callerSocketId === socketId) ||
      (session.receiverId === userId && session.receiverSocketId === socketId)
    );
  }

  private async _handleRingTimeout(callId: string): Promise<void> {
    const session = await this._videoCallService.getSession(callId);
    if (!session) return;
    if (session.status !== CallStatus.RINGING) return;

    this.logger.log(`Call ${callId} timed out (MISSED)`);
    await this._finalizeSession(session, CallEndReason.MISSED);
  }

  private async _handleReconnectTimeout(callId: string): Promise<void> {
    const session = await this._videoCallService.getSession(callId);
    if (!session) return;
    if (session.status !== CallStatus.RECONNECTING) return;

    this.logger.log(`Call ${callId} reconnect grace expired (DISCONNECTED)`);
    await this._finalizeSession(session, CallEndReason.DISCONNECTED);
  }

  private _scheduleReconnectGrace(callId: string, onExpire: () => void): void {
    this._clearReconnectGrace(callId);
    const timer = setTimeout(() => {
      this._reconnectGrace.delete(callId);
      onExpire();
    }, RECONNECT_GRACE_MS);
    timer.unref?.();
    this._reconnectGrace.set(callId, timer);
  }

  private _clearReconnectGrace(callId: string): void {
    const timer = this._reconnectGrace.get(callId);
    if (timer) {
      clearTimeout(timer);
      this._reconnectGrace.delete(callId);
    }
  }

  private async _finalizeSession(session: ICallSession, reason: CallEndReason): Promise<void> {
    const { callId } = session;

    // Idempotent: if the session is already gone, nothing to do.
    const current = await this._videoCallService.getSession(callId);
    if (!current) return;

    await this._videoCallService.updateStatus(callId, CallStatus.ENDED, 60);

    this.server.to(this._roomKey(session.callerId)).emit(VIDEO_CALL_ENDED, { callId, reason });
    this.server.to(this._roomKey(session.receiverId)).emit(VIDEO_CALL_ENDED, { callId, reason });

    // Remove every socket from the signaling room.
    this.server.in(this._callRoom(callId)).socketsLeave(this._callRoom(callId));

    this._clearReconnectGrace(callId);
    await this._videoCallService.cleanup(callId);

    this.logger.log(`Call ${callId} finalized with reason ${reason}`);
  }
}
