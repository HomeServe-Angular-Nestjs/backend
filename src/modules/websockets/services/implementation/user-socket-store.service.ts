import { Inject, Injectable } from '@nestjs/common';
import { IUserSocketStoreService } from '@modules/websockets/services/interface/user-socket-store-service.interface';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@configs/redis/redis.module';

@Injectable()
export class UserSocketStoreService implements IUserSocketStoreService {
    constructor(
        @Inject(REDIS_CLIENT)
        private readonly _redis: Redis,
    ) { }

    private _getRedisKey(userId: string, namespace: string): string {
        return `user_socket:${namespace}:${userId}`;
    }

    private _getVideoRoomKey(namespace: string, userId: string) {
        return `room:${namespace}:${userId}`;
    }

    private _getProviderRoomKey(providerId: string): string {
        return `provider_room:${providerId}`;
    }

    async addSocket(userId: string, socketId: string, namespace: string): Promise<void> {
        const key = this._getRedisKey(userId, namespace);
        await this._redis.sadd(key, socketId);
    }

    async removeSocket(userId: string, socketId: string, namespace: string): Promise<void> {
        const key = this._getRedisKey(userId, namespace);
        await this._redis.srem(key, socketId);
        const remaining = await this._redis.scard(key);
        if (remaining === 0) {
            await this._redis.del(key);
        }
    }

    async getSockets(userId: string, namespace: string): Promise<string[]> {
        const key = this._getRedisKey(userId, namespace);
        return await this._redis.smembers(key);
    }

    async hasSockets(userId: string, namespace: string): Promise<boolean> {
        const key = this._getRedisKey(userId, namespace);
        return (await this._redis.scard(key)) > 0
    }

    async removeAllSockets(userId: string, namespace: string): Promise<void> {
        const key = this._getRedisKey(userId, namespace);
        await this._redis.del(key);
    }

    async addToProviderRoom(providerId: string, customerId: string): Promise<void> {
        const key = this._getProviderRoomKey(providerId);
        await this._redis.sadd(key, customerId);
    }

    async removeFromProviderRoom(providerId: string, customerId: string): Promise<void> {
        const key = this._getProviderRoomKey(providerId);
        await this._redis.srem(key, customerId);
    }

    async addToVideoCallRoom(namespace: string, userId: string) {
        const key = this._getVideoRoomKey(namespace, userId);
        await this._redis.sadd(key, userId);
    }

    async removeFromVideoCallRoom(namespace: string, userId: string): Promise<void> {
        const key = this._getVideoRoomKey(namespace, userId);
        await this._redis.srem(key, userId);
    }
}