import { ServiceOffered } from '../../../../core/entities/implementation/service.entity';
import { IService, IServicesWithPagination, ISubService } from '../../../../core/entities/interfaces/service.entity.interface';
import { CreateServiceDto, FilterServiceDto, ProviderServiceFilterWithPaginationDto, ToggleServiceStatusDto, ToggleSubServiceStatusDto, UpdateServiceDto, UpdateSubServiceDto, UpdateSubServiceWrapperDto } from '../../dtos/service.dto';

export interface IServiceFeatureService {
  // createService(dto: CreateServiceDto, user: IPayload): Promise<ServiceOffered>;
  fetchServices(providerId: string, page: number, filter: Omit<ProviderServiceFilterWithPaginationDto, 'page'>): Promise<IServicesWithPagination>;
  fetchService(id: string): Promise<IService>;
  updateService(updateData: UpdateServiceDto,): Promise<IService>;
  updateSubservice(updateData: UpdateSubServiceWrapperDto): Promise<{ id: string, subService: ISubService }>;
  fetchFilteredServices(id: string, filter: FilterServiceDto): Promise<IService[]>;
  toggleServiceStatus(dto: ToggleServiceStatusDto): Promise<boolean>;
  toggleSubServiceStatus(dto: ToggleSubServiceStatusDto): Promise<boolean>;
}
