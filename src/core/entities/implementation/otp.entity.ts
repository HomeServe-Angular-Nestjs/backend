import { BaseEntity } from '../base/implementation/base.entity';
import { IOtp } from '../interfaces/otp.entity.interface';

export class OTP extends BaseEntity implements IOtp {
  email: string;
  code: string;
  expiresAt: Date;

  constructor(partial: Partial<OTP>) {
    super(partial);
    Object.assign(this, partial);
  }
}
