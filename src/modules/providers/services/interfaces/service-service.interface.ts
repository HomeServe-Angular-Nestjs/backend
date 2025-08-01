import {
    IService, IServicesWithPagination
} from '@core/entities/interfaces/service.entity.interface';
import { IResponse } from '@core/misc/response.util';
import {
    CreateServiceDto, FilterServiceDto, ProviderServiceFilterWithPaginationDto, RemoveSubServiceDto,
    ToggleServiceStatusDto, ToggleSubServiceStatusDto, UpdateServiceDto
} from '@modules/providers/dtos/service.dto';

export interface IServiceFeatureService {
  createService(providerID: string, dto: CreateServiceDto): Promise<IResponse<string[]>>;
  fetchServices(providerId: string, page: number, filter: Omit<ProviderServiceFilterWithPaginationDto, 'page'>): Promise<IServicesWithPagination>;
  fetchService(id: string): Promise<IService>;
  updateService(updateData: UpdateServiceDto,): Promise<IResponse<IService>>;
  fetchFilteredServices(id: string, filter: FilterServiceDto): Promise<IService[]>;
  toggleServiceStatus(dto: ToggleServiceStatusDto): Promise<boolean>;
  toggleSubServiceStatus(dto: ToggleSubServiceStatusDto): Promise<boolean>;
  removeService(providerID: string, serviceId: string): Promise<IResponse>;
  removeSubService(dto: RemoveSubServiceDto): Promise<IResponse>;
  getServiceTitles(): Promise<IResponse<string[]>>;
}
