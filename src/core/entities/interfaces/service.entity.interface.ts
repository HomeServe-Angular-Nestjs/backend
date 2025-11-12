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
  providerId: string;
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

export interface ICustomerSearchServices {
  id: string;
  title: string;
  image: string;
  provider: string;
  offeredServiceIds: string[];
}

export interface IGetServiceTitle {
  id: string;
  title: string;
}