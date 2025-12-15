import { Inject, Injectable } from '@nestjs/common';
import { IOtpRepository } from '@core/repositories/interfaces/otp-repo.interface';
import { REDIS_CLIENT } from '@configs/redis/redis.module';
import Redis from 'ioredis';
import { IOtp } from '@core/entities/interfaces/otp.entity.interface';

@Injectable()
export class OtpRepository implements IOtpRepository {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly _redis: Redis,
  ) { }

  private _getKey(email: string): string {
    return `otp:${email}`;
  }

  async removePreviousOtp(email: string): Promise<void> {
    await this._redis.del(this._getKey(email));
  }

  async create(data: { email: string; code: string }): Promise<IOtp | null> {
    const key = this._getKey(data.email);

    console.log(key);

    const result = await this._redis.set(key, data.code, 'EX', 60); //TTL 60 seconds

    if (result !== 'OK') return null;

    return {
      email: data.email,
      code: data.code,
    } as unknown as IOtp;
  }

  async findOtp(email: string): Promise<IOtp | null> {
    const key = this._getKey(email);
    const code = await this._redis.get(key);

    if (!code) return null;

    return {
      email,
      code,
    } as unknown as IOtp;
  }
}
