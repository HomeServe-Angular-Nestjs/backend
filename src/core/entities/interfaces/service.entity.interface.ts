import { IEntity } from '../base/interfaces/base-entity.entity.interface';
import { IPagination } from './booking.entity.interface';

export interface ISubService {
  id?: string;
  title: string;
  desc: string;
  price: string;
  estimatedTime: string;
  image: string;
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

export interface IServicesWithPagination {
  services: IService[];
  pagination: IPagination;
}
