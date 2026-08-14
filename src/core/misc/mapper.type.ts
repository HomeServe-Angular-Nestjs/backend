import type { IAdminMapper } from '@core/dto-mapper/interface/admin.mapper.interface';
import type { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import type { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';
import type { AdminDocument } from '@core/schema/admin.schema';
import type { CustomerDocument } from '@core/schema/customer.schema';
import type { ProviderDocument } from '@core/schema/provider.schema';

export type UserDocumentMapType = {
  customer: CustomerDocument;
  provider: ProviderDocument;
  admin: AdminDocument;
};

export type UserMapperMapType = {
  customer: ICustomerMapper;
  provider: IProviderMapper;
  admin: IAdminMapper;
};
