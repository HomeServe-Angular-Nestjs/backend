import { Injectable } from '@nestjs/common';
import { IAdminRepository } from '../interfaces/admin-repo.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AdminDocument } from '../../schema/admin.schema';
import { ADMIN_MODEL_NAME } from '../../constants/model.constant';
import { BaseRepository } from '../base/implementations/base.repository';
import { Admin } from '../../entities/implementation/admin.entity';

@Injectable()
export class AdminRepository
  extends BaseRepository<Admin, AdminDocument>
  implements IAdminRepository
{
  constructor(
    @InjectModel(ADMIN_MODEL_NAME) private adminModel: Model<AdminDocument>,
  ) {
    super(adminModel);
  }

  protected toEntity(doc: AdminDocument): Admin {
    return new Admin({
      id: (doc._id as Types.ObjectId).toString(),
      email: doc.email,
      password: doc.password,
    });
  }
}
