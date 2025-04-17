import { BaseEntity } from '../base/implementation/base.entity';
import { IService, ISubService } from '../interfaces/service.entity.interface';

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
  }
}
