import { OTP } from "../../common/entities/implementation/otp.entity";
import { IBaseRepository } from "../../common/repositories/interfaces/base-repo.interface";
import { OtpDocument } from "../../schema/otp.schema";

export interface IOtpRepository extends IBaseRepository<OTP, OtpDocument> {
    removePreviousOtp(email: string): Promise<void>;
    findValidOtp(email: string, code: string): Promise<OtpDocument | null>
}