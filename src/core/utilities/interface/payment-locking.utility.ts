import { UserType } from "@core/entities/interfaces/user.entity.interface";

export interface IPaymentLockingUtility {
    generatePaymentKey(userId: string, type: UserType): string;
    acquireLock(key: string, ttlSeconds: number): Promise<boolean>;
    releaseLock(key: string): Promise<void>;
    isLocked(key: string): Promise<boolean>;
    getTTL(key: string): Promise<number>;
} 