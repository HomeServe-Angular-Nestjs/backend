import { IEntity } from '../base/interfaces/base-entity.entity.interface';
import { IPagination } from './booking.entity.interface';

export interface IAdmin extends IEntity {
  email: string;
  password: string;
  fullname?: string;
  username?: string;
  type: 'admin';
  isDeleted: boolean;
  isActive: boolean;
}

export interface IUserData {
  id: string;
  username: string;
  email: string;
  contact: string;
  createdAt: Date;
  isActive: boolean;
  isDeleted: boolean
}

export interface IUserDataWithPagination {
  data: IUserData[],
  pagination: IPagination
}