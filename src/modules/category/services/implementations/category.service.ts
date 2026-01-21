import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { IProfessionRepository } from "@core/repositories/interfaces/profession-repo.interface";
import { IServiceCategoryRepository } from "@core/repositories/interfaces/service-category-repo.interface";
import { IProfessionMapper } from "@core/dto-mapper/interface/profession.mapper.interface";
import { IServiceCategoryMapper } from "@core/dto-mapper/interface/service-category.mapper.interface";
import { Profession } from "@core/entities/implementation/profession.entity";
import { ServiceCategory } from "@core/entities/implementation/service-category.entity";
import { CategoryFilterDto, CategoryServiceFilterDto, CreateProfessionDto, CreateServiceCategoryDto } from "../../dto/category.dto";
import { PROFESSION_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { SERVICE_CATEGORY_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { PROFESSION_MAPPER, SERVICE_CATEGORY_MAPPER } from "@core/constants/mappers.constant";
import { ICategoryService } from "@modules/category/services/interfaces/category-service.interface";
import { IResponse } from "@core/misc/response.util";
import { ErrorCodes } from "@core/enum/error.enum";
import { IServiceCategory, IServiceCategoryWithPagination } from "@core/entities/interfaces/service-category.entity.interface";
import { ICustomerSearchCategories } from "@core/entities/interfaces/service.entity.interface";


@Injectable()
export class CategoryService implements ICategoryService {
    constructor(
        @Inject(PROFESSION_REPOSITORY_NAME)
        private readonly _professionRepository: IProfessionRepository,
        @Inject(SERVICE_CATEGORY_REPOSITORY_NAME)
        private readonly _serviceCategoryRepository: IServiceCategoryRepository,
        @Inject(PROFESSION_MAPPER)
        private readonly _professionMapper: IProfessionMapper,
        @Inject(SERVICE_CATEGORY_MAPPER)
        private readonly _serviceCategoryMapper: IServiceCategoryMapper
    ) { }

    private async _validateProfession(name: string): Promise<void> {
        const existing = await this._professionRepository.count({ name: name.toString() })
        if (existing !== 0) throw new ConflictException({
            code: ErrorCodes.CONFLICT,
            message: 'Profession already exists'
        });
    }

    async createProfession(professionDto: CreateProfessionDto): Promise<IResponse<Profession>> {
        await this._validateProfession(professionDto.name);

        const profession = new Profession({
            name: professionDto.name,
            isActive: professionDto.isActive ?? true,
            isDeleted: false
        });
        const doc = this._professionMapper.toDocument(profession);

        const saved = await this._professionRepository.create(doc);

        if (!saved) throw new InternalServerErrorException({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: 'Profession creation failed'
        });

        return {
            success: true,
            message: 'Profession created successfully',
            data: this._professionMapper.toEntity(saved)
        }
    }

    async updateProfession(updateProfessionData: CreateProfessionDto, professionId: string): Promise<IResponse<Profession>> {
        await this._validateProfession(updateProfessionData.name);

        const profession = new Profession({
            name: updateProfessionData.name,
            isActive: updateProfessionData.isActive ?? true,
            isDeleted: false
        });
        const doc = this._professionMapper.toDocument(profession);

        const saved = await this._professionRepository.update(professionId, doc);

        if (!saved) throw new InternalServerErrorException({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: 'Profession update failed'
        });

        return {
            success: true,
            message: 'Profession updated successfully',
            data: this._professionMapper.toEntity(saved)
        }
    }

    async findAllProfessions(filter: CategoryFilterDto): Promise<IResponse<Profession[]>> {
        const docs = await this._professionRepository.findAllWithFilter(filter);
        return {
            success: true,
            message: 'Professions fetched successfully',
            data: docs.map(doc => this._professionMapper.toEntity(doc))
        }
    }

    async toggleProfessionStatus(professionId: string): Promise<IResponse> {
        const updated = await this._professionRepository.toggleStatus(professionId);
        if (!updated) throw new BadRequestException({
            code: ErrorCodes.NOT_FOUND,
            message: 'Profession not found'
        });

        return {
            success: updated,
            message: 'Profession status toggled successfully',
        };
    }

    async deleteProfession(professionId: string): Promise<IResponse> {
        const deleted = await this._professionRepository.removeProfession(professionId);
        if (!deleted) throw new BadRequestException({
            code: ErrorCodes.NOT_FOUND,
            message: 'Profession not found'
        });

        return {
            success: deleted,
            message: 'Profession deleted successfully',
        };
    }

    async createServiceCategory(dto: CreateServiceCategoryDto): Promise<IResponse<IServiceCategory>> {
        const serviceCategory = new ServiceCategory({
            name: dto.name,
            professionId: dto.professionId,
            keywords: dto.keywords ?? [],
            isActive: dto.isActive ?? true,
            isDeleted: false
        });
        const doc = this._serviceCategoryMapper.toDocument(serviceCategory);
        const saved = await this._serviceCategoryRepository.create(doc);

        if (!saved) throw new InternalServerErrorException({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: 'Service category creation failed'
        });

        return {
            success: true,
            message: 'Service category created successfully',
            data: this._serviceCategoryMapper.toEntity(saved)
        }
    }

    async updateServiceCategory(dto: CreateServiceCategoryDto, serviceCategoryId: string): Promise<IResponse<IServiceCategory>> {
        const serviceCategory = new ServiceCategory({
            name: dto.name,
            professionId: dto.professionId,
            keywords: dto.keywords ?? [],
            isActive: dto.isActive ?? true,
            isDeleted: false
        });
        const doc = this._serviceCategoryMapper.toDocument(serviceCategory);
        const saved = await this._serviceCategoryRepository.updateCategoryService(serviceCategoryId, doc);

        if (!saved) throw new InternalServerErrorException({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: 'Service category update failed'
        });

        return {
            success: true,
            message: 'Service category updated successfully',
            data: this._serviceCategoryMapper.toEntity(saved)
        }
    }

    async findAllServiceCategories(filter: CategoryServiceFilterDto): Promise<IResponse<IServiceCategoryWithPagination>> {
        const { page = 1, limit = 10, ...restFilter } = filter;
        const [docs, total] = await Promise.all([
            this._serviceCategoryRepository.findAllWithFilterWithPagination(restFilter, { page, limit }),
            this._serviceCategoryRepository.count()
        ]);

        return {
            success: true,
            message: 'Service categories fetched successfully',
            data: {
                services: docs.map(doc => this._serviceCategoryMapper.toEntity(doc)),
                pagination: { total, page, limit }
            }
        }
    }

    async toggleServiceCategoryStatus(serviceCategoryId: string): Promise<IResponse> {
        const updated = await this._serviceCategoryRepository.toggleStatus(serviceCategoryId);
        if (!updated) throw new BadRequestException({
            code: ErrorCodes.NOT_FOUND,
            message: 'Service category not found'
        });

        return {
            success: updated,
            message: 'Service category status toggled successfully',
        };
    }

    async deleteServiceCategory(id: string): Promise<IResponse> {
        const deleted = await this._serviceCategoryRepository.removeServiceCategory(id);
        if (!deleted) throw new BadRequestException({
            code: ErrorCodes.NOT_FOUND,
            message: 'Service category not found'
        });

        return {
            success: deleted,
            message: 'Service category deleted successfully',
        };
    }

    async searchCategories(search: string): Promise<IResponse<ICustomerSearchCategories[]>> {
        if (!search.trim()) {
            return {
                success: true,
                message: 'empty search.',
                data: []
            };
        }

        const categoryDocs = await this._serviceCategoryRepository.searchCategories(search);
        if (categoryDocs.length === 0) {
            return {
                success: true,
                message: 'No services matched your search.',
                data: []
            };
        }

        const categories = categoryDocs.map(category => this._serviceCategoryMapper.toEntity(category));

        const searchResponse = categories.map(cat => ({
            categoryId: cat.id,
            categoryName: cat.name,
        }));

        return {
            success: true,
            message: 'Services fetched successfully',
            data: searchResponse
        }
    }
}
