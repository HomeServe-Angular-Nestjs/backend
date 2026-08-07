import { ICustomerDetailsBundle, IProviderDetailsBundle } from '@core/entities/interfaces/admin-user-details.entity.interface';
import { IResponse } from '@core/misc/response.util';

export interface IAdminUserDetailsService {
    getCustomerDetails(customerId: string): Promise<IResponse<ICustomerDetailsBundle>>;
    getProviderDetails(providerId: string): Promise<IResponse<IProviderDetailsBundle>>;
}