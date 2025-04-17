import { OTP } from '../../entities/implementation/otp.entity';
import { IBaseRepository } from '../base/interfaces/base-repo.interface';
import { OtpDocument } from '../../schema/otp.schema';

export interface IOtpRepository extends IBaseRepository<OTP, OtpDocument> {
  removePreviousOtp(email: string): Promise<void>;
  findValidOtp(email: string, code: string): Promise<OtpDocument | null>;
}
