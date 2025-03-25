import { BaseEntity } from "./base.entity";

export class OTP extends BaseEntity {
    email: string;
    code: string;
    expiresAt: Date;

    constructor(partial: Partial<OTP>) {
        super(partial)
        Object.assign(this, partial);
    }
}