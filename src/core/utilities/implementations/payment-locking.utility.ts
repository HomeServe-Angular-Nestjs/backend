import { REDIS_CLIENT } from "@configs/redis/redis.module";
import { IPaymentLockingUtility } from "@core/utilities/interface/payment-locking.utility";
import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class PaymentLockingUtility implements IPaymentLockingUtility {
    constructor(
        @Inject(REDIS_CLIENT)
        private readonly _redis: Redis,
    ) { }

    generatePaymentKey(userId: string, type: string) {
        return `payment:${userId}:${type}`;
    }

    async acquireLock(key: string, ttlSeconds: number = 300): Promise<boolean> {
        const result = await this._redis.set(key, 'locked', 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }

    async releaseLock(key: string): Promise<void> {
        await this._redis.del(key);
    }

    async isLocked(key: string): Promise<boolean> {
        const ttl = await this._redis.ttl(key);
        return ttl > 0;
    }

    async getTTL(key: string): Promise<number> {
        return this._redis.ttl(key);
    }
}