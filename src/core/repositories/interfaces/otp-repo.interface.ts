import { OtpDocument } from '../../schema/otp.schema';
import { IBaseRepository } from '../base/interfaces/base-repo.interface';

export interface IOtpRepository extends IBaseRepository<OtpDocument> {
  removePreviousOtp(email: string): Promise<void>;
  findOtp(email: string): Promise<OtpDocument | null>;
}
