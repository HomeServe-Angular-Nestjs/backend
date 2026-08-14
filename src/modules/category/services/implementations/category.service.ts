import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { IProfessionRepository } from '@core/repositories/interfaces/profession-repo.interface';
import { IServiceCategoryRepository } from '@core/repositories/interfaces/service-category-repo.interface';
import { IProfessionMapper } from '@core/dto-mapper/interface/profession.mapper.interface';
import { IServiceCategoryMapper } from '@core/dto-mapper/interface/service-category.mapper.interface';
import { Profession } from '@core/entities/implementation/profession.entity';
import { ServiceCategory } from '@core/entities/implementation/service-category.entity';
import { CategoryFilterDto, CategoryServiceFilterDto, CreateProfessionDto, CreateServiceCategoryDto } from '../../dto/category.dto';
import {
  PROFESSION_REPOSITORY_NAME,
  SERVICE_CATEGORY_REPOSITORY_NAME,
  PROVIDER_SERVICE_REPOSITORY_NAME,
} from '@core/constants/repository.constant';
import { IProviderServiceRepository } from '@core/repositories/interfaces/provider-service-repo.interface';
import { PROFESSION_MAPPER, SERVICE_CATEGORY_MAPPER } from '@core/constants/mappers.constant';
import { ICategoryService } from '@modules/category/services/interfaces/category-service.interface';
import { IResponse } from '@core/misc/response.util';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { IServiceCategory, IServiceCategoryWithPagination } from '@core/entities/interfaces/service-category.entity.interface';
import { ICustomerSearchCategories } from '@core/entities/interfaces/service.entity.interface';

@Injectable()
export class CategoryService implements ICategoryService {
  constructor(
    @Inject(PROFESSION_REPOSITORY_NAME)
    private readonly _professionRepository: IProfessionRepository,
    @Inject(SERVICE_CATEGORY_REPOSITORY_NAME)
    private readonly _serviceCategoryRepository: IServiceCategoryRepository,
    @Inject(PROVIDER_SERVICE_REPOSITORY_NAME)
    private readonly _providerServiceRepository: IProviderServiceRepository,
    @Inject(PROFESSION_MAPPER)
    private readonly _professionMapper: IProfessionMapper,
    @Inject(SERVICE_CATEGORY_MAPPER)
    private readonly _serviceCategoryMapper: IServiceCategoryMapper,
  ) {}

  private async _isProfessionActive(professionId: string): Promise<boolean> {
    if (!professionId) return false;
    const profession = await this._professionRepository.findById(professionId);
    return !!profession && profession.isActive !== false;
  }

  private async _validateServiceCategoryName(name: string, professionId: string, excludeId?: string): Promise<void> {
    const existing = await this._serviceCategoryRepository.findByNameAndProfession(name, professionId, excludeId);
    if (existing)
      throw new ConflictException({
        code: ErrorCodes.CONFLICT,
        message: ErrorMessage.SERVICE_CATEGORY_ALREADY_EXISTS,
      });
  }

  private async _deactivateCategories(professionId: string): Promise<void> {
    const categoryIds = await this._serviceCategoryRepository.deactivateByProfessionId(professionId);
    if (categoryIds.length) {
      await this._providerServiceRepository.deactivateByCategoryIds(categoryIds);
    }
  }

  private async _deactivateProviderServices(categoryId: string): Promise<void> {
    await this._providerServiceRepository.deactivateByCategoryIds([categoryId]);
  }

  private async _validateProfession(name: string, excludeId?: string): Promise<void> {
    const existing = await this._professionRepository.findByName(name, excludeId);
    if (existing)
      throw new ConflictException({
        code: ErrorCodes.CONFLICT,
        message: ErrorMessage.PROFESSION_ALREADY_EXISTS,
      });
  }

  async createProfession(professionDto: CreateProfessionDto): Promise<IResponse<Profession>> {
    await this._validateProfession(professionDto.name);

    const profession = new Profession({
      name: professionDto.name,
      isActive: professionDto.isActive ?? true,
      isDeleted: false,
    });
    const doc = this._professionMapper.toDocument(profession);

    const saved = await this._professionRepository.create(doc);

    if (!saved)
      throw new InternalServerErrorException({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: ErrorMessage.PROFESSION_CREATION_FAILED,
      });

    return {
      success: true,
      message: 'Profession created successfully',
      data: this._professionMapper.toEntity(saved),
    };
  }

  async updateProfession(updateProfessionData: CreateProfessionDto, professionId: string): Promise<IResponse<Profession>> {
    await this._validateProfession(updateProfessionData.name, professionId);

    const profession = new Profession({
      name: updateProfessionData.name,
      isActive: updateProfessionData.isActive ?? true,
      isDeleted: false,
    });
    const doc = this._professionMapper.toDocument(profession);

    const saved = await this._professionRepository.update(professionId, doc);

    if (!saved)
      throw new InternalServerErrorException({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: ErrorMessage.PROFESSION_UPDATE_FAILED,
      });

    if (saved.isActive === false) {
      await this._deactivateCategories(professionId);
    }

    return {
      success: true,
      message: 'Profession updated successfully',
      data: this._professionMapper.toEntity(saved),
    };
  }

  async findAllProfessions(filter: CategoryFilterDto): Promise<IResponse<Profession[]>> {
    const docs = await this._professionRepository.findAllWithFilter(filter);
    return {
      success: true,
      message: 'Professions fetched successfully',
      data: docs.map((doc) => this._professionMapper.toEntity(doc)),
    };
  }

  async toggleProfessionStatus(professionId: string): Promise<IResponse> {
    const existing = await this._professionRepository.findById(professionId);
    if (!existing)
      throw new BadRequestException({
        code: ErrorCodes.NOT_FOUND,
        message: ErrorMessage.PROFESSION_NOT_FOUND,
      });

    const updated = await this._professionRepository.toggleStatus(professionId);
    if (!updated)
      throw new BadRequestException({
        code: ErrorCodes.NOT_FOUND,
        message: ErrorMessage.PROFESSION_NOT_FOUND,
      });

    if (existing.isActive === true) {
      await this._deactivateCategories(professionId);
    }

    return {
      success: updated,
      message: 'Profession status toggled successfully',
    };
  }

  async createServiceCategory(dto: CreateServiceCategoryDto): Promise<IResponse<IServiceCategory>> {
    await this._validateServiceCategoryName(dto.name, dto.professionId);

    const professionActive = await this._isProfessionActive(dto.professionId);
    const serviceCategory = new ServiceCategory({
      name: dto.name,
      professionId: dto.professionId,
      keywords: dto.keywords ?? [],
      isActive: professionActive ? (dto.isActive ?? true) : false,
      isDeleted: false,
    });
    const doc = this._serviceCategoryMapper.toDocument(serviceCategory);
    const saved = await this._serviceCategoryRepository.create(doc);

    if (!saved)
      throw new InternalServerErrorException({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: ErrorMessage.SERVICE_CATEGORY_CREATION_FAILED,
      });

    return {
      success: true,
      message: 'Service category created successfully',
      data: this._serviceCategoryMapper.toEntity(saved),
    };
  }

  async updateServiceCategory(dto: CreateServiceCategoryDto, serviceCategoryId: string): Promise<IResponse<IServiceCategory>> {
    await this._validateServiceCategoryName(dto.name, dto.professionId, serviceCategoryId);

    const professionActive = await this._isProfessionActive(dto.professionId);
    const serviceCategory = new ServiceCategory({
      name: dto.name,
      professionId: dto.professionId,
      keywords: dto.keywords ?? [],
      isActive: professionActive ? (dto.isActive ?? true) : false,
      isDeleted: false,
    });
    const doc = this._serviceCategoryMapper.toDocument(serviceCategory);
    const saved = await this._serviceCategoryRepository.updateCategoryService(serviceCategoryId, doc);

    if (!saved)
      throw new InternalServerErrorException({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: ErrorMessage.SERVICE_CATEGORY_UPDATE_FAILED,
      });

    if (saved.isActive === false) {
      await this._deactivateProviderServices(serviceCategoryId);
    }

    return {
      success: true,
      message: 'Service category updated successfully',
      data: this._serviceCategoryMapper.toEntity(saved),
    };
  }

  async findAllServiceCategories(filter: CategoryServiceFilterDto): Promise<IResponse<IServiceCategoryWithPagination>> {
    const { page = 1, limit = 10, ...restFilter } = filter;
    const [docs, total] = await Promise.all([
      this._serviceCategoryRepository.findAllWithFilterWithPagination(restFilter, { page, limit }),
      this._serviceCategoryRepository.countWithFilter(restFilter),
    ]);

    return {
      success: true,
      message: 'Service categories fetched successfully',
      data: {
        services: docs.map((doc) => this._serviceCategoryMapper.toEntity(doc)),
        pagination: { total, page, limit },
      },
    };
  }

  async toggleServiceCategoryStatus(serviceCategoryId: string): Promise<IResponse> {
    const existing = await this._serviceCategoryRepository.findById(serviceCategoryId);
    if (!existing)
      throw new BadRequestException({
        code: ErrorCodes.NOT_FOUND,
        message: ErrorMessage.SERVICE_CATEGORY_NOT_FOUND,
      });

    if (existing.isActive === false) {
      const professionActive = await this._isProfessionActive(String(existing.professionId));
      if (!professionActive) {
        throw new BadRequestException({
          code: ErrorCodes.PARENT_PROFESSION_INACTIVE,
          message: ErrorMessage.CATEGORY_ACTIVATION_BLOCKED,
        });
      }
    }

    const updated = await this._serviceCategoryRepository.toggleStatus(serviceCategoryId);
    if (!updated)
      throw new BadRequestException({
        code: ErrorCodes.NOT_FOUND,
        message: ErrorMessage.SERVICE_CATEGORY_NOT_FOUND,
      });

    if (existing.isActive === true) {
      await this._deactivateProviderServices(serviceCategoryId);
    }

    return {
      success: updated,
      message: 'Service category status toggled successfully',
    };
  }

  async searchCategories(search: string): Promise<IResponse<ICustomerSearchCategories[]>> {
    if (!search.trim()) {
      return {
        success: true,
        message: 'empty search.',
        data: [],
      };
    }

    const categoryDocs = await this._serviceCategoryRepository.searchCategories(search);
    if (categoryDocs.length === 0) {
      return {
        success: true,
        message: 'No services matched your search.',
        data: [],
      };
    }

    const categories = categoryDocs.map((category) => this._serviceCategoryMapper.toEntity(category));

    const searchResponse = categories.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
    }));

    return {
      success: true,
      message: 'Services fetched successfully',
      data: searchResponse,
    };
  }

  async fetchAvailableServiceByProfessionId(professionId: string): Promise<IResponse<IServiceCategory[]>> {
    const serviceCategoryDocs = await this._serviceCategoryRepository.fetchAvailableServiceByProfessionId(professionId);
    if (serviceCategoryDocs.length === 0) {
      return {
        success: true,
        message: 'No services matched your search.',
        data: [],
      };
    }

    const serviceCategories = serviceCategoryDocs.map((serviceCategory) => this._serviceCategoryMapper.toEntity(serviceCategory));

    return {
      success: true,
      message: 'Services fetched successfully',
      data: serviceCategories,
    };
  }
}
