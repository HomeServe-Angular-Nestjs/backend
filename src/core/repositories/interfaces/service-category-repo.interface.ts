import { IServiceCategoryFilter } from "@core/entities/interfaces/service-category.entity.interface";
import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { ServiceCategoryDocument } from "@core/schema/service-category";
import { FilterQuery } from "mongoose";

export interface IServiceCategoryRepository extends IBaseRepository<ServiceCategoryDocument> {
    findAllWithFilterWithPagination(filter: IServiceCategoryFilter, options?: { page: number, limit: number }): Promise<ServiceCategoryDocument[]>;
    updateCategoryService(serviceCategoryId: string, update: Partial<ServiceCategoryDocument>): Promise<ServiceCategoryDocument | null>;
    toggleStatus(serviceCategoryId: string): Promise<boolean>;
    removeServiceCategory(serviceCategoryId: string): Promise<boolean>;
    count(filter?: FilterQuery<ServiceCategoryDocument>): Promise<number>;
    searchCategories(search: string): Promise<ServiceCategoryDocument[]>;
}