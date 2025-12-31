import { IProviderService } from "@core/entities/interfaces/provider-service.entity.interface";
import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { ProviderServiceDocument, ProviderServicePopulatedDocument } from "@core/schema/provider-service.schema";

export interface IProviderServiceRepository extends IBaseRepository<ProviderServiceDocument> {
    createAndPopulate(doc: Partial<ProviderServiceDocument>): Promise<ProviderServicePopulatedDocument>;
    updateAndPopulateByServiceId(serviceId: string, update: Partial<IProviderService>): Promise<ProviderServicePopulatedDocument | null>;
    findAllAndPopulateByProviderId(providerId: string): Promise<ProviderServicePopulatedDocument[]>;
    updateStatusByServiceId(serviceId: string): Promise<boolean>;
    deleteService(serviceId: string): Promise<boolean>;
    count(filter?: any): Promise<number>;
    isServiceExist(serviceId: string): Promise<boolean>;
    isServiceExistByCategoryId(categoryId: string): Promise<boolean>;
}
