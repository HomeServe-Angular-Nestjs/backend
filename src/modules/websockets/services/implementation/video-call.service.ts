import { REDIS_CLIENT } from '@configs/redis/redis.module';
import { IVideoCallService } from '@modules/websockets/services/interface/video-call-service.interface';
import { ICallSession } from '@core/entities/interfaces/call-session.interface';
import { CallStatus } from '@core/enum/call.enum';
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

export const CALL_SESSION_TTL_S = 90;
export const ACTIVE_CALL_TTL_S = 3600;

@Injectable()
export class VideoCallService implements IVideoCallService {
  private readonly _timeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly _redis: Redis,
  ) {}

  private _sessionKey(callId: string): string {
    return `call:session:${callId}`;
  }

  private _activeKey(userId: string): string {
    return `call:active:${userId}`;
  }

  async createSession(
    callId: string,
    callerId: string,
    receiverId: string,
    callerSocketId: string,
    ttlSeconds: number,
  ): Promise<ICallSession> {
    const now = new Date();
    const session: ICallSession = {
      callId,
      callerId,
      receiverId,
      callerSocketId,
      receiverSocketId: null,
      status: CallStatus.RINGING,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
    };

    const pipeline = this._redis.pipeline();
    pipeline.hset(
      this._sessionKey(callId),
      'callId',
      session.callId,
      'callerId',
      session.callerId,
      'receiverId',
      session.receiverId,
      'callerSocketId',
      session.callerSocketId,
      'receiverSocketId',
      '',
      'status',
      session.status,
      'createdAt',
      session.createdAt,
      'expiresAt',
      session.expiresAt,
    );
    pipeline.expire(this._sessionKey(callId), ttlSeconds);
    pipeline.set(this._activeKey(callerId), callId, 'EX', ttlSeconds);
    pipeline.set(this._activeKey(receiverId), callId, 'EX', ttlSeconds);
    await pipeline.exec();

    return session;
  }

  async getSession(callId: string): Promise<ICallSession | null> {
    const data = await this._redis.hgetall(this._sessionKey(callId));
    if (!data || !data.callId) return null;

    return {
      callId: data.callId,
      callerId: data.callerId,
      receiverId: data.receiverId,
      callerSocketId: data.callerSocketId,
      receiverSocketId: data.receiverSocketId || null,
      status: data.status as CallStatus,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
    };
  }

  async updateStatus(callId: string, status: CallStatus, ttlSeconds?: number): Promise<void> {
    const pipeline = this._redis.pipeline();
    pipeline.hset(this._sessionKey(callId), 'status', status);
    if (ttlSeconds !== undefined) {
      pipeline.expire(this._sessionKey(callId), ttlSeconds);
    }
    await pipeline.exec();
  }

  async setReceiverSocket(callId: string, receiverSocketId: string): Promise<void> {
    await this._redis.hset(this._sessionKey(callId), 'receiverSocketId', receiverSocketId);
  }

  async setSocketForUser(callId: string, userId: string, socketId: string): Promise<void> {
    const session = await this.getSession(callId);
    if (!session) return;

    if (session.callerId === userId) {
      await this._redis.hset(this._sessionKey(callId), 'callerSocketId', socketId);
    } else if (session.receiverId === userId) {
      await this._redis.hset(this._sessionKey(callId), 'receiverSocketId', socketId);
    }
  }

  async getActiveCallId(userId: string): Promise<string | null> {
    return await this._redis.get(this._activeKey(userId));
  }

  async getUserCallPartner(userId: string): Promise<string | null> {
    const callId = await this.getActiveCallId(userId);
    if (!callId) return null;

    const session = await this.getSession(callId);
    if (!session) return null;

    return session.callerId === userId ? session.receiverId : session.callerId;
  }

  scheduleTimeout(callId: string, ms: number, onExpire: (callId: string) => void): void {
    this.clearTimeout(callId);
    const timer = setTimeout(() => {
      this._timeouts.delete(callId);
      onExpire(callId);
    }, ms);
    timer.unref?.();
    this._timeouts.set(callId, timer);
  }

  clearTimeout(callId: string): void {
    const timer = this._timeouts.get(callId);
    if (timer) {
      clearTimeout(timer);
      this._timeouts.delete(callId);
    }
  }

  async cleanup(callId: string): Promise<void> {
    this.clearTimeout(callId);

    const session = await this.getSession(callId);
    if (!session) return;

    const pipeline = this._redis.pipeline();
    pipeline.del(this._sessionKey(callId));
    pipeline.del(this._activeKey(session.callerId));
    pipeline.del(this._activeKey(session.receiverId));
    await pipeline.exec();
  }
}
