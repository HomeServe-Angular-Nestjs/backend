import { Model, Types } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { OTP_MODEL_NAME } from '../../constants/model.constant';
import { OtpDocument } from '../../schema/otp.schema';
import { BaseRepository } from '../base/implementations/base.repository';
import { IOtpRepository } from '../interfaces/otp-repo.interface';

@Injectable()
export class OtpRepository extends BaseRepository<OtpDocument> implements IOtpRepository {
  constructor(
    @InjectModel(OTP_MODEL_NAME) private otpModel: Model<OtpDocument>,
  ) {
    super(otpModel);
  }

  async removePreviousOtp(email: string): Promise<void> {
    await this.otpModel.deleteMany({ email });
  }

  async findOtp(email: string): Promise<OtpDocument | null> {
    return this.otpModel.findOne({ email });
  }
}
