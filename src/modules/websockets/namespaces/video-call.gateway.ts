import { Inject, UseFilters } from '@nestjs/common';
import { BaseSocketGateway, corsOption } from '@modules/websockets/namespaces/base.gateway';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';

import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CallReceiverDto, SignalPayloadDto } from '@modules/websockets/dto/video-call.dto';
import { CUSTOM_DTO_VALIDATOR_NAME } from '@core/constants/utility.constant';
import { ICustomDtoValidator } from '@core/utilities/interface/custom-dto-validator.utility.interface';
import {
  AUTH_SOCKET_SERVICE_NAME,
  USER_SOCKET_STORE_SERVICE_NAME,
  VIDEO_CALL_SERVICE_NAME,
} from '@core/constants/service.constant';
import { IVideoCallService } from '@modules/websockets/services/interface/video-call-service.interface';
import { GlobalWsExceptionFilter } from '@core/exception-filters/ws-exception.filters';
import { IAuthSocketService } from '@modules/websockets/services/interface/auth-socket-service.interface';
import { IUserSocketStoreService } from '@modules/websockets/services/interface/user-socket-store-service.interface';

const namespace = 'video-call';
const VIDEO_CALL_UNAVAILABLE = 'video-call:unavailable';
const VIDEO_CALL_INITIATE = 'video-call:initiate';
const VIDEO_CALL_USER_LEFT = 'video-call:leave';
const VIDEO_CALL_RINGING = 'video-call:ringing';
const VIDEO_CALL_ACCEPT = 'video-call:accept';
const SIGNAL = 'video-call:signal';

@UseFilters(GlobalWsExceptionFilter)
@WebSocketGateway({ cors: corsOption, namespace })
export class VideoCallGateway extends BaseSocketGateway {
  @WebSocketServer()
  private server: Server;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly _loggerFactory: ILoggerFactory,
    @Inject(AUTH_SOCKET_SERVICE_NAME)
    private readonly _authSocketService: IAuthSocketService,
    @Inject(USER_SOCKET_STORE_SERVICE_NAME)
    private readonly _userSocketService: IUserSocketStoreService,
    @Inject(CUSTOM_DTO_VALIDATOR_NAME)
    private readonly _customDtoValidatorUtility: ICustomDtoValidator,
    @Inject(VIDEO_CALL_SERVICE_NAME)
    private readonly _videoCallService: IVideoCallService,
  ) {
    super();
    this.logger = this._loggerFactory.createLogger(VideoCallGateway.name);
  }

  protected override async onClientConnect(client: Socket): Promise<void> {
    try {
      const payload = await this._authSocketService.validateToken(client);
      const { sub: userId, type: userType } = payload;

      client.data.user = { id: userId, type: userType };
      client.join(this._roomKey(userId));

      await this._userSocketService.addSocket(userId, client.id, namespace);
      this.logger.log(`User ${userId} connected with socket ID: ${client.id}`);
    } catch (error) {
      this.logger.error('Token verification failed during socket connection');
      client.emit('token:expired');
      setTimeout(() => client.disconnect(), 200);
    }
  }

  protected override async onClientDisConnect(client: Socket): Promise<void> {
    this.logger.debug(`Client disconnected: ${client.id}`);

    const roomKey = await this._videoCallService.findRoomForClient(client.id, 'video-call');
    if (roomKey) {
      const parts = roomKey.split(':');
      const namespace = parts[1];
      const [first, second] = parts[2].split('-');
      await this._videoCallService.removeClientFromRoom(namespace, first, second);
      client.to(roomKey).emit(VIDEO_CALL_USER_LEFT, { socketId: client.id });
    }
  }

  private _roomKey(userId: string): string {
    return `room:${userId}`;
  }

  @SubscribeMessage(VIDEO_CALL_INITIATE)
  async handleCallInitiate(@ConnectedSocket() client: Socket, @MessageBody() body: CallReceiverDto) {
    await this._customDtoValidatorUtility.validateDto(CallReceiverDto, body);
    const user = this._getClient(client);
    const { callee } = body;

    const roomKey = this._roomKey(callee);
    const socketsInRoom = await this.server.in(roomKey).fetchSockets();
    const socketIds = socketsInRoom.map((s) => s.id);

    for (const id of socketIds) {
      client.to(id).emit(VIDEO_CALL_RINGING, { callerId: user.id });
    }
  }

  @SubscribeMessage(VIDEO_CALL_ACCEPT)
  async handleCallAccept(@ConnectedSocket() client: Socket, @MessageBody() body: { callerId: string }) {
    const { id: callee, type } = this._getClient(client);
    const { callerId } = body;

    const roomKey = this._roomKey(callerId);
    const socketsInRoom = await this.server.in(roomKey).fetchSockets();
    const socketIds = socketsInRoom.map((s) => s.id);

    if (!socketIds.length) {
      client.emit(VIDEO_CALL_UNAVAILABLE, { message: 'Caller is offline' });
      return;
    }

    for (const id of socketIds) {
      this.server.to(id).emit(VIDEO_CALL_ACCEPT, {
        calleeId: callee,
        calleeType: type,
      });
    }

    this.logger.log(`Call accepted by user ${callee} for caller ${callerId}`);
  }

  @SubscribeMessage(SIGNAL)
  async handleSignal(@ConnectedSocket() client: Socket, @MessageBody() data: SignalPayloadDto) {
    await this._customDtoValidatorUtility.validateDto(SignalPayloadDto, data);
    const { targetUserId, type, offer, answer, candidate } = data;

    if (!targetUserId) {
      this.logger.error('Signal event missing targetUserId');
      return;
    }

    const roomKey = this._roomKey(targetUserId);
    const socketsInRoom = await this.server.in(roomKey).fetchSockets();

    if (!socketsInRoom.length) {
      this.logger.warn(`No active sockets found for target user: ${targetUserId}`);
      return;
    }

    const payloadToSend = { from: client.id, type, offer, answer, candidate };
    for (const socket of socketsInRoom) {
      this.server.to(socket.id).emit(SIGNAL, payloadToSend);
    }
  }
}
