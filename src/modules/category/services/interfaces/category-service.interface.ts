import { IResponse } from "@core/misc/response.util";
import { CategoryFilterDto, CategoryServiceFilterDto, CreateProfessionDto, CreateServiceCategoryDto } from "@modules/category/dto/category.dto";
import { IServiceCategory, IServiceCategoryWithPagination } from "@core/entities/interfaces/service-category.entity.interface";
import { IProfession } from "@core/entities/interfaces/profession.entity.interface";

export interface ICategoryService {
    createProfession(createProfessionDto: CreateProfessionDto): Promise<IResponse<IProfession>>;
    updateProfession(updateProfessionData: CreateProfessionDto, professionId: string): Promise<IResponse<IProfession>>;
    findAllProfessions(professionFilter: CategoryFilterDto): Promise<IResponse<IProfession[]>>;
    toggleProfessionStatus(professionId: string): Promise<IResponse>;
    deleteProfession(professionId: string): Promise<IResponse>;

    createServiceCategory(createServiceCategoryDto: CreateServiceCategoryDto): Promise<IResponse<IServiceCategory>>;
    updateServiceCategory(updateServiceCategoryDto: CreateServiceCategoryDto, serviceCategoryId: string): Promise<IResponse<IServiceCategory>>;
    findAllServiceCategories(serviceCategoryFilter: CategoryServiceFilterDto): Promise<IResponse<IServiceCategoryWithPagination>>;
    toggleServiceCategoryStatus(serviceCategoryId: string): Promise<IResponse>;
    deleteServiceCategory(serviceCategoryId: string): Promise<IResponse>;
}