import { UserType } from '../../../../modules/auth/dtos/login.dto';
import { IEntity } from './base-entity.entity.interface';

export interface IBaseUserEntity extends IEntity {
  email: string;
  password: string;
  username: string;
  isBlocked: boolean;
  lastLoginAt?: Date;
  isDeleted: boolean;
  avatar: string;
  fullname: string;
  phone: number;
  googleId: string;
  type?: UserType;
}
