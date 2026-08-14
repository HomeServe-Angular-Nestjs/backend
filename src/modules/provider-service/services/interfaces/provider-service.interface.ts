import type { IResponse } from '@core/misc/response.util';
import type { CreateProviderServiceDto, UpdateProviderServiceDto, ProviderServiceFilterDto } from '../../dto/provider-service.dto';
import type { IProviderServiceUI } from '@core/entities/interfaces/provider-service.entity.interface';
import { IProviderService } from '@core/entities/interfaces/provider-service.entity.interface';
import type { UserType } from '@core/entities/interfaces/user.entity.interface';

export interface IProviderServiceService {
  createService(
    providerId: string,
    userType: UserType,
    dto: CreateProviderServiceDto,
    file: Express.Multer.File,
  ): Promise<IResponse<IProviderServiceUI>>;
  updateService(
    providerId: string,
    userType: UserType,
    serviceId: string,
    dto: UpdateProviderServiceDto,
    file: Express.Multer.File,
  ): Promise<IResponse<IProviderServiceUI>>;
  findAllByProviderId(
    providerId: string,
    filters: ProviderServiceFilterDto,
    activeOnly?: boolean,
  ): Promise<IResponse<IProviderServiceUI[]>>;
  toggleStatus(serviceId: string): Promise<IResponse>;
  deleteService(serviceId: string): Promise<IResponse>;
  canProviderCreateService(providerId: string, userType: UserType): Promise<IResponse<boolean>>;
}
