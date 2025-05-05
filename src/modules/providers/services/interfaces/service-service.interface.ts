import { ServiceOffered } from '../../../../core/entities/implementation/service.entity';
import { IService, ISubService } from '../../../../core/entities/interfaces/service.entity.interface';
import { IPayload } from '../../../../core/misc/payload.interface';
import { CreateServiceDto, UpdateServiceDto, UpdateSubServiceDto, UpdateSubServiceWrapperDto } from '../../dtos/service.dto';

export interface IServiceFeatureService {
  createService(dto: CreateServiceDto, user: IPayload): Promise<ServiceOffered>;
  fetchServices(user: IPayload): Promise<IService[]>;
  fetchService(id: string): Promise<IService>;
  updateService(updateData: UpdateServiceDto,): Promise<IService>;
  updateSubservice(updateData: UpdateSubServiceWrapperDto): Promise<{ id: string, subService: ISubService }>;

}
