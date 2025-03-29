import { OTP } from "src/auth/common/entities/implementation/otp.entity";
import { IBaseRepository } from "src/auth/common/repositories/interfaces/base-repo.interface";
import { OtpDocument } from "src/auth/schema/otp.schema";

export interface IOtpRepository extends IBaseRepository<OTP, OtpDocument> {
    removePreviousOtp(email: string): Promise<void>;
    findValidOtp(email: string, code: string): Promise<OtpDocument | null>
}