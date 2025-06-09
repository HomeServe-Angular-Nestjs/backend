import { IEntity } from '../base/interfaces/base-entity.entity.interface';

export interface IAdmin extends IEntity {
  email: string;
  password: string;
  type: 'admin';
  isDeleted: boolean,
}

export interface IUserData {
  id: string;
  username: string;
  email: string;
  contact: string;
  createdAt: Date;
  isBlocked: boolean;
  isActive: boolean;
  isDeleted: boolean
}