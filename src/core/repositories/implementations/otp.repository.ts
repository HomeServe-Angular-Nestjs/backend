import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { OTP } from "../../entities/implementation/otp.entity";
import { BaseRepository } from "../base/implementations/base.repository";
import { OTP_MODEL_NAME } from "../../constants/model.constant";
import { OtpDocument } from "../../schema/otp.schema";
import { IOtpRepository } from "../interfaces/otp-repo.interface";

@Injectable()
export class OtpRepository extends BaseRepository<OTP, OtpDocument> implements IOtpRepository {

    constructor(@InjectModel(OTP_MODEL_NAME) private otpModel: Model<OtpDocument>) {
        super(otpModel);
    }

    async removePreviousOtp(email: string): Promise<void> {
        await this.otpModel.deleteMany({ email });
    }

    async findValidOtp(email: string, code: string): Promise<OtpDocument | null> {
        return this.otpModel.findOne({ email, code })
    }

    protected toEntity(doc: OtpDocument): OTP {
        return new OTP({
            id: (doc._id as Types.ObjectId).toString(),
            email: doc.email,
            code: doc.code,
            expiresAt: doc.expiresAt,
        });
    }
}