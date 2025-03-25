import { OTP } from "src/auth/common/entities/otp.entity";
import { IBaseRepository } from "src/auth/common/repositories/interfaces/base-repo.interface";
import { OtpDocument } from "src/auth/schema/otp.schema";

export interface IOtpRepository extends IBaseRepository<OTP> {
    removePreviousOtp(email: string): Promise<void>;
     findValidOtp(email: string, code: string): Promise<OtpDocument | null>
}