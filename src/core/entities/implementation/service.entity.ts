import { BaseEntity } from '../base/implementation/base.entity';
import { IService, ISubService } from '../interfaces/service.entity.interface';

export class SubService {
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

  constructor(partial: Partial<SubService>) {
    Object.assign(this, partial);
  }
}

export class ServiceOffered extends BaseEntity implements IService {
  title: string;
  desc: string;
  image: string;
  subService: Partial<ISubService>[] = [];
  isActive?: boolean;
  isVerified?: boolean;
  isDeleted?: boolean;

  constructor(partial: Partial<ServiceOffered>) {
    super(partial);
    Object.assign(this, partial);
    if (partial.subService) {
      this.subService = partial.subService.map((s) => new SubService(s));
    }
  }
}
