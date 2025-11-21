import { OtpDocument } from '../../schema/otp.schema';
import { IBaseRepository } from '../base/interfaces/base-repo.interface';

export interface IOtpRepository {
  removePreviousOtp(email: string): Promise<void>;
  findOtp(email: string): Promise<OtpDocument | null>;
  create(data: { email: string; code: string }): Promise<OtpDocument | null>;
}
