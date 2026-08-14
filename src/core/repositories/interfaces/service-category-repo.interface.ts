import type { IServiceCategoryFilter } from '@core/entities/interfaces/service-category.entity.interface';
import type { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import type { ServiceCategoryDocument } from '@core/schema/service-category';
import type { FilterQuery } from 'mongoose';

export interface IServiceCategoryRepository extends IBaseRepository<ServiceCategoryDocument> {
  findAllWithFilterWithPagination(
    filter: IServiceCategoryFilter,
    options?: { page: number; limit: number },
  ): Promise<ServiceCategoryDocument[]>;
  countWithFilter(filter?: IServiceCategoryFilter): Promise<number>;
  updateCategoryService(serviceCategoryId: string, update: Partial<ServiceCategoryDocument>): Promise<ServiceCategoryDocument | null>;
  toggleStatus(serviceCategoryId: string): Promise<boolean>;
  count(filter?: FilterQuery<ServiceCategoryDocument>): Promise<number>;
  searchCategories(search: string): Promise<ServiceCategoryDocument[]>;
  fetchAvailableServiceByProfessionId(professionId: string): Promise<ServiceCategoryDocument[]>;
  deactivateByProfessionId(professionId: string): Promise<string[]>;
  findByNameAndProfession(name: string, professionId: string, excludeId?: string): Promise<ServiceCategoryDocument | null>;
}
