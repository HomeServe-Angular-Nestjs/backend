import { Model, Types } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ADMIN_MODEL_NAME } from '../../constants/model.constant';
import { AdminDocument } from '../../schema/admin.schema';
import { BaseRepository } from '../base/implementations/base.repository';
import { IAdminRepository } from '../interfaces/admin-repo.interface';

@Injectable()
export class AdminRepository extends BaseRepository<AdminDocument> implements IAdminRepository {
  constructor(
    @InjectModel(ADMIN_MODEL_NAME)
    private _adminModel: Model<AdminDocument>,
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
}
