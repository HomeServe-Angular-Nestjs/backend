import { ServiceCategoryDocument } from "@core/schema/service-category";
import { IServiceCategory } from "@core/entities/interfaces/service-category.entity.interface";

export interface IServiceCategoryMapper {
    toDocument(dto: IServiceCategory): Partial<ServiceCategoryDocument>;
    toEntity(doc: ServiceCategoryDocument): IServiceCategory;
}
