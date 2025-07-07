import { IAdmin } from '../interfaces/admin.entity.interface';
import { BaseEntity } from '../base/implementation/base.entity';

export class Admin extends BaseEntity implements IAdmin {
  email: string;
  password: string;
  fullname?: string;
  username?: string;
  avatar?: string;
  type: 'admin';
  isDeleted: boolean;
  isActive: boolean;

  constructor(partial: Partial<Admin>) {
    super(partial);
    Object.assign(this, partial);
  }
}
