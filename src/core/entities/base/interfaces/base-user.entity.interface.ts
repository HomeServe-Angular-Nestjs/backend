import { UserType } from '../../../../modules/auth/dtos/login.dto';
import { ILocation } from '../../interfaces/user.entity.interface';
import { IEntity } from './base-entity.entity.interface';

export interface IBaseUserEntity extends IEntity {
  email: string;
  password: string;
  username: string;
  lastLoginAt?: Date;
  isDeleted: boolean;
  isActive: boolean;
  avatar: string;
  fullname: string;
  phone: string;
  googleId: string;
  type?: UserType;
  location?: ILocation;
  address: string;
}
