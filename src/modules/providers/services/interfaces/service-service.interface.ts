import { ServiceOffered } from '../../../../core/entities/implementation/service.entity';
import { IService, ISubService } from '../../../../core/entities/interfaces/service.entity.interface';
import { IPayload } from '../../../auth/misc/payload.interface';
import { CreateServiceDto, UpdateServiceDto, UpdateSubServiceDto, UpdateSubServiceWrapperDto } from '../../dtos/service.dto';

export interface IServiceFeatureService {
  createService(dto: CreateServiceDto, user: IPayload): Promise<ServiceOffered>;
  fetchServices(user: IPayload): Promise<IService[]>;
  updateService(updateData: UpdateServiceDto): Promise<IService>;
  updateSubservice(updateData: UpdateSubServiceWrapperDto)
}
