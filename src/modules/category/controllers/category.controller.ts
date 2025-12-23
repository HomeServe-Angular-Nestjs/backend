import { Body, Controller, Get, Put, Query, Param, Inject, Patch, Delete, Post } from "@nestjs/common";
import { CategoryFilterDto, CategoryServiceFilterDto, CreateProfessionDto, CreateServiceCategoryDto } from "../dto/category.dto";
import { ICategoryService } from "@modules/category/services/interfaces/category-service.interface";
import { CATEGORY_SERVICE_NAME } from "@core/constants/service.constant";
import { Profession } from "@core/entities/implementation/profession.entity";
import { IResponse } from "@core/misc/response.util";
import { ServiceCategory } from "@core/entities/implementation/service-category.entity";
import { isValidIdPipe } from "@core/pipes/is-valid-id.pipe";
import { IServiceCategoryWithPagination } from "@core/entities/interfaces/service-category.entity.interface";

@Controller('category')
export class CategoryController {
    constructor(
        @Inject(CATEGORY_SERVICE_NAME)
        private readonly _categoryService: ICategoryService
    ) { }

    @Post('profession')
    async createProfession(@Body() createProfessionDto: CreateProfessionDto): Promise<IResponse<Profession>> {
        return await this._categoryService.createProfession(createProfessionDto);
    }

    @Put('profession/:id')
    async updateProfession(@Body() updateProfessionDto: CreateProfessionDto, @Param('id', new isValidIdPipe()) professionId: string): Promise<IResponse<Profession>> {
        return await this._categoryService.updateProfession(updateProfessionDto, professionId);
    }

    @Post('service')
    async createServiceCategory(@Body() createServiceCategoryDto: CreateServiceCategoryDto): Promise<IResponse<ServiceCategory>> {
        return await this._categoryService.createServiceCategory(createServiceCategoryDto);
    }

    @Put('service/:id')
    async updateServiceCategory(@Body() createServiceCategoryDto: CreateServiceCategoryDto, @Param('id', new isValidIdPipe()) serviceCategoryId: string): Promise<IResponse<ServiceCategory>> {
        return await this._categoryService.updateServiceCategory(createServiceCategoryDto, serviceCategoryId);
    }

    @Get('profession')
    async findAllProfessions(@Query() categoryFilter: CategoryFilterDto): Promise<IResponse<Profession[]>> {
        return await this._categoryService.findAllProfessions(categoryFilter);
    }

    @Get('service')
    async findAllServiceCategories(@Query() categoryFilter: CategoryServiceFilterDto): Promise<IResponse<IServiceCategoryWithPagination>> {
        return await this._categoryService.findAllServiceCategories(categoryFilter);
    }

    @Patch('profession/:id/toggle-status')
    async toggleProfessionStatus(@Param('id', new isValidIdPipe()) professionId: string): Promise<IResponse> {
        return await this._categoryService.toggleProfessionStatus(professionId);
    }

    @Patch('service/:id/toggle-status')
    async toggleServiceCategoryStatus(@Param('id', new isValidIdPipe()) serviceCategoryId: string): Promise<IResponse> {
        return await this._categoryService.toggleServiceCategoryStatus(serviceCategoryId);
    }

    @Delete('profession/:id')
    async deleteProfession(@Param('id', new isValidIdPipe()) professionId: string): Promise<IResponse> {
        return await this._categoryService.deleteProfession(professionId);
    }

    @Delete('service/:id')
    async deleteServiceCategory(@Param('id', new isValidIdPipe()) serviceCategoryId: string): Promise<IResponse> {
        return await this._categoryService.deleteServiceCategory(serviceCategoryId);
    }
}
