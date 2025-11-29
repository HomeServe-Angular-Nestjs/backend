import { IService, IServicesWithPagination } from '@core/entities/interfaces/service.entity.interface';
import { IResponse } from '@core/misc/response.util';
import { CreateServiceDto, FilterServiceDto, ProviderServiceFilterWithPaginationDto, RemoveSubServiceDto, ToggleServiceStatusDto, ToggleSubServiceStatusDto, UpdateServiceDto } from '@modules/providers/dtos/service.dto';

export interface IServiceFeatureService {
  createService(providerID: string, createServiceDto: CreateServiceDto): Promise<IResponse<string[]>>;
  fetchServices(providerId: string, page: number, filter: Omit<ProviderServiceFilterWithPaginationDto, 'page'>): Promise<IServicesWithPagination>;
  fetchService(id: string): Promise<IService>;
  updateService(updateData: UpdateServiceDto,): Promise<IResponse<IService>>;
  fetchFilteredServices(id: string, filter: FilterServiceDto): Promise<IService[]>;
  toggleServiceStatus(toggleServiceStatusDto: ToggleServiceStatusDto): Promise<boolean>;
  toggleSubServiceStatus(toggleSubServiceStatusDto: ToggleSubServiceStatusDto): Promise<boolean>;
  removeService(providerID: string, serviceId: string): Promise<IResponse>;
  removeSubService(removeServiceDto: RemoveSubServiceDto): Promise<IResponse>;
  getServiceTitles(): Promise<IResponse<string[]>>;
}
