import { IEntity } from '../base/interfaces/base-entity.entity.interface';

export interface ISubService {
  id?: string;
  title: string;
  desc: string;
  price: string;
  estimatedTime: string;
  image: string;
  tag: string;
  isActive?: boolean;
  isVerified?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IService extends IEntity {
  title: string;
  desc: string;
  image: string;
  subService: Partial<ISubService>[];
  isActive?: boolean;
  isVerified?: boolean;
  isDeleted?: boolean;
}
