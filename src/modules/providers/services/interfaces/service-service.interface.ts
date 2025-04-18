import { ServiceOffered } from '../../../../core/entities/implementation/service.entity';
import { IPayload } from '../../../auth/misc/payload.interface';
import { CreateServiceDto } from '../../dtos/service.dto';

export interface IServiceFeatureService {
  createService(dto: CreateServiceDto, user: IPayload): Promise<ServiceOffered>;
  fetchServices(user: IPayload)
}
