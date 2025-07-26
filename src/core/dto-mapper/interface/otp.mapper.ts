import { IOtp } from "@core/entities/interfaces/otp.entity.interface";
import { OtpDocument } from "@core/schema/otp.schema";

export interface IOtpMapper {
    toEntity(doc: OtpDocument): IOtp;
}