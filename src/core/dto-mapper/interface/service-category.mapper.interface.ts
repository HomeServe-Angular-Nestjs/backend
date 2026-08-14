import type { ServiceCategoryDocument } from '@core/schema/service-category';
import type { IServiceCategory } from '@core/entities/interfaces/service-category.entity.interface';

export interface IServiceCategoryMapper {
  toDocument(dto: IServiceCategory): Partial<ServiceCategoryDocument>;
  toEntity(doc: ServiceCategoryDocument): IServiceCategory;
}
