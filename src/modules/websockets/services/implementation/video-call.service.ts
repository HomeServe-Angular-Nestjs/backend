import { REDIS_CLIENT } from '@configs/redis/redis.module';
import { IVideoCallService } from '@modules/websockets/services/interface/video-call-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class VideoCallService implements IVideoCallService {
    constructor(
        @Inject(REDIS_CLIENT)
        private readonly _redis: Redis,
    ) { }

    getRoomKey(namespace: string, callerId: string, receiverId: string): string {
        const [first, second] = [callerId, receiverId].sort();
        return `${namespace}:${first}-${second}`;
    }

    async addCallerAndReceiverToRoom(namespace: string, callerId: string, receiverId: string): Promise<string> {
        const roomKey = this.getRoomKey(namespace, callerId, receiverId);
        await this._redis.sadd(roomKey, callerId);
        return roomKey;
    }

    async removeClientFromRoom(namespace: string, callerId: string, receiverId: string): Promise<string> {
        const roomKey = this.getRoomKey(namespace, callerId, receiverId);
        await this._redis.srem(roomKey, callerId);
        const count = await this._redis.scard(roomKey);
        if (count === 0) {
            await this._redis.del(roomKey);
        }
        return roomKey;
    }

    async getRoomMembers(namespace: string, callerId: string, receiverId: string): Promise<string[]> {
        const roomKey = this.getRoomKey(namespace, callerId, receiverId);
        return this._redis.smembers(roomKey);
    }

    async findRoomForClient(clientId: string, namespace: string): Promise<string | null> {
        const stream = this._redis.scanStream({ match: `room:${namespace}:*`, count: 100 });
        return await new Promise((resolve) => {
            stream.on('data', async (keys: string[]) => {
                for (const key of keys) {
                    const isMember = await this._redis.sismember(key, clientId);
                    if (isMember) {
                        stream.destroy();
                        resolve(key);
                        return;
                    }
                }
            });
            stream.on('end', () => resolve(null));
        });
    }
}
