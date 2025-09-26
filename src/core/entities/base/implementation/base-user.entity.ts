import { ILocation } from '../../interfaces/user.entity.interface';
import { IBaseUserEntity } from '../interfaces/base-user.entity.interface';
import { BaseEntity } from './base.entity';

export abstract class BaseUserEntity extends BaseEntity implements IBaseUserEntity {
  email: string;
  password: string;
  username: string;
  fullname: string;
  phone: string;
  avatar: string;
  isActive: boolean;
  isDeleted: boolean;
  location?: ILocation;
  lastLoginAt?: Date;
  googleId: string;
  address: string;
  subscriptionId: string | null;

  constructor(partial: Partial<BaseUserEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
