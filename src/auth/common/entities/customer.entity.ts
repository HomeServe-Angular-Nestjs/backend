import { BaseEntity } from "./base.entity";

export class Customer extends BaseEntity {
    email: string;
    password: string;
    username: string;
    fullname: string;
    phone: number;
    avatar: string;
    isActive: boolean;
    isVerified: boolean;
    isBlocked: boolean;
    isDeleted: boolean;
    lastLoginAt: Date;

    constructor(partial: Partial<Customer>) {
        super(partial);
        Object.assign(this, partial)
    }
}