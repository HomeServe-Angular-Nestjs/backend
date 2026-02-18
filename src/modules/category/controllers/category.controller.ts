import { Body, Controller, Get, Put, Query, Param, Inject, Patch, Delete, Post } from "@nestjs/common";
import { CategoryFilterDto, CategoryServiceFilterDto, CreateProfessionDto, CreateServiceCategoryDto } from "../dto/category.dto";
import { ICategoryService } from "@modules/category/services/interfaces/category-service.interface";
import { CATEGORY_SERVICE_NAME } from "@core/constants/service.constant";
import { IResponse } from "@core/misc/response.util";
import { isValidIdPipe } from "@core/pipes/is-valid-id.pipe";
import { IServiceCategory, IServiceCategoryWithPagination } from "@core/entities/interfaces/service-category.entity.interface";
import { ICustomerSearchCategories } from "@core/entities/interfaces/service.entity.interface";
import { IProfession } from "@core/entities/interfaces/profession.entity.interface";

@Controller('category')
export class CategoryController {
    constructor(
        @Inject(CATEGORY_SERVICE_NAME)
        private readonly _categoryService: ICategoryService
    ) { }

    @Post('profession')
    async createProfession(@Body() createProfessionDto: CreateProfessionDto): Promise<IResponse<IProfession>> {
        return await this._categoryService.createProfession(createProfessionDto);
    }

    @Post('service')
    async createServiceCategory(@Body() createServiceCategoryDto: CreateServiceCategoryDto): Promise<IResponse<IServiceCategory>> {
        return await this._categoryService.createServiceCategory(createServiceCategoryDto);
    }

    @Get('profession')
    async findAllProfessions(@Query() categoryFilter: CategoryFilterDto): Promise<IResponse<IProfession[]>> {
        return await this._categoryService.findAllProfessions(categoryFilter);
    }

    @Get('service')
    async findAllServiceCategories(@Query() categoryFilter: CategoryServiceFilterDto): Promise<IResponse<IServiceCategoryWithPagination>> {
        return await this._categoryService.findAllServiceCategories(categoryFilter);
    }

    @Get('search')
    async searchCategories(@Query() { search }: { search: string }): Promise<IResponse<ICustomerSearchCategories[]>> {
        return this._categoryService.searchCategories(search);
    }

    @Put('profession/:id')
    async updateProfession(@Body() updateProfessionDto: CreateProfessionDto, @Param('id', new isValidIdPipe()) professionId: string): Promise<IResponse<IProfession>> {
        return await this._categoryService.updateProfession(updateProfessionDto, professionId);
    }

    @Put('service/:id')
    async updateServiceCategory(@Body() createServiceCategoryDto: CreateServiceCategoryDto, @Param('id', new isValidIdPipe()) serviceCategoryId: string): Promise<IResponse<IServiceCategory>> {
        return await this._categoryService.updateServiceCategory(createServiceCategoryDto, serviceCategoryId);
    }

    @Delete('profession/:id')
    async deleteProfession(@Param('id', new isValidIdPipe()) professionId: string): Promise<IResponse> {
        return await this._categoryService.deleteProfession(professionId);
    }

    @Delete('service/:id')
    async deleteServiceCategory(@Param('id', new isValidIdPipe()) serviceCategoryId: string): Promise<IResponse> {
        return await this._categoryService.deleteServiceCategory(serviceCategoryId);
    }

    @Get('profession/:id/available-services')
    async fetchAvailableServiceByProfessionId(@Param('id', new isValidIdPipe()) professionId: string): Promise<IResponse<IServiceCategory[]>> {
        return await this._categoryService.fetchAvailableServiceByProfessionId(professionId); 
    }


    @Patch('profession/:id/toggle-status')
    async toggleProfessionStatus(@Param('id', new isValidIdPipe()) professionId: string): Promise<IResponse> {
        return await this._categoryService.toggleProfessionStatus(professionId);
    }

    @Patch('service/:id/toggle-status')
    async toggleServiceCategoryStatus(@Param('id', new isValidIdPipe()) serviceCategoryId: string): Promise<IResponse> {
        return await this._categoryService.toggleServiceCategoryStatus(serviceCategoryId);
    }
}
