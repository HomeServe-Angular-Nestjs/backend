import { Model, Types } from 'mongoose';

import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ADMIN_MODEL_NAME } from '../../constants/model.constant';
import { AdminDocument } from '../../schema/admin.schema';
import { BaseRepository } from '../base/implementations/base.repository';
import { IAdminRepository } from '../interfaces/admin-repo.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ErrorMessage } from '@core/enum/error.enum';

@Injectable()
export class AdminRepository extends BaseRepository<AdminDocument> implements IAdminRepository {
  private readonly logger: ICustomLogger;

  constructor(
    @InjectModel(ADMIN_MODEL_NAME)
    private _adminModel: Model<AdminDocument>,
    @Inject(LOGGER_FACTORY)
    private readonly _loggerFactory: ILoggerFactory
  ) {
    super(_adminModel);
  }


  async findByEmail(email: string): Promise<AdminDocument | null> {
    return await this._adminModel.findOne({ email }).exec();
  }

  async createAdmin(email: string, password: string): Promise<AdminDocument> {
    return await this._adminModel.findOneAndUpdate(
      { email },
      { $set: { email, password } },
      {
        upsert: true,
        new: true
      }
    );
  }

  async getAdminId(): Promise<string> {
    const admin = await this._adminModel.findOne();
    if (!admin) {
      this.logger.error('Failed to get admin.');
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }

    return (admin._id as Types.ObjectId).toString();
  }
}
