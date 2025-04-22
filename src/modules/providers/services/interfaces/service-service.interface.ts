import { ServiceOffered } from '../../../../core/entities/implementation/service.entity';
import { IService } from '../../../../core/entities/interfaces/service.entity.interface';
import { IPayload } from '../../../auth/misc/payload.interface';
import { CreateServiceDto, UpdateServiceDto } from '../../dtos/service.dto';

export interface IServiceFeatureService {
  createService(dto: CreateServiceDto, user: IPayload): Promise<ServiceOffered>;
  fetchServices(user: IPayload): Promise<IService[]>;
  updateService(updateData: UpdateServiceDto);
}
