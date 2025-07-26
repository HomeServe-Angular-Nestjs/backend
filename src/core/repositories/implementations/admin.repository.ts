import { Model, Types } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ADMIN_MODEL_NAME } from '../../constants/model.constant';
import { Admin } from '../../entities/implementation/admin.entity';
import { AdminDocument } from '../../schema/admin.schema';
import { BaseRepository } from '../base/implementations/base.repository';
import { IAdminRepository } from '../interfaces/admin-repo.interface';

@Injectable()
export class AdminRepository extends BaseRepository<AdminDocument> implements IAdminRepository {
  constructor(
    @InjectModel(ADMIN_MODEL_NAME)
    private adminModel: Model<AdminDocument>,
  ) {
    super(adminModel);
  }

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return await this.adminModel.findOne({ email }).exec();
  }
}
