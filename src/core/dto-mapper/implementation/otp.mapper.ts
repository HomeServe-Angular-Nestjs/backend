import { IOtpMapper } from "@core/dto-mapper/interface/otp.mapper";
import { OTP } from "@core/entities/implementation/otp.entity";
import { IOtp } from "@core/entities/interfaces/otp.entity.interface";
import { OtpDocument } from "@core/schema/otp.schema";
import { Injectable } from "@nestjs/common";

@Injectable()
export class OtpMapper implements IOtpMapper {
    toEntity(doc: OtpDocument): IOtp {
        return new OTP({
            id: doc.id,
            email: doc.email,
            code: doc.code,
        });
    }

    toDocument(entity: Partial<IOtp>): Partial<OtpDocument> {
        return {
            email: entity.email,
            code: entity.code,
        }
    }
}