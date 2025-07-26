import { IAdminMapper } from "@core/dto-mapper/interface/admin.mapper.interface";
import { ICustomerMapper } from "@core/dto-mapper/interface/customer.mapper";
import { IProviderMapper } from "@core/dto-mapper/interface/provider.mapper";
import { AdminDocument } from "@core/schema/admin.schema";
import { CustomerDocument } from "@core/schema/customer.schema";
import { ProviderDocument } from "@core/schema/provider.schema";

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