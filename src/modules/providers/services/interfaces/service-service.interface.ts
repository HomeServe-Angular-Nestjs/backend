import { ServiceOffered } from '../../../../core/entities/implementation/service.entity';
import { IService, ISubService } from '../../../../core/entities/interfaces/service.entity.interface';
import { IPayload } from '../../../../core/misc/payload.interface';
import { CreateServiceDto, FilterServiceDto, ToggleServiceStatusDto, ToggleSubServiceStatusDto, UpdateServiceDto, UpdateSubServiceDto, UpdateSubServiceWrapperDto } from '../../dtos/service.dto';

export interface IServiceFeatureService {
  // createService(dto: CreateServiceDto, user: IPayload): Promise<ServiceOffered>;
  fetchServices(user: IPayload): Promise<IService[]>;
  fetchService(id: string): Promise<IService>;
  updateService(updateData: UpdateServiceDto,): Promise<IService>;
  updateSubservice(updateData: UpdateSubServiceWrapperDto): Promise<{ id: string, subService: ISubService }>;
  fetchFilteredServices(id: string, filter: FilterServiceDto): Promise<IService[]>;
  toggleServiceStatus(dto: ToggleServiceStatusDto): Promise<boolean>;
  toggleSubServiceStatus(dto: ToggleSubServiceStatusDto): Promise<boolean>;
}
