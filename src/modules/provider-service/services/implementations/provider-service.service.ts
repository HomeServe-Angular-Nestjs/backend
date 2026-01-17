import { BadRequestException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { PROFESSION_REPOSITORY_NAME, PROVIDER_SERVICE_REPOSITORY_NAME, SERVICE_CATEGORY_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { PROVIDER_SERVICE_MAPPER } from "@core/constants/mappers.constant";
import { IProviderServiceRepository } from "@core/repositories/interfaces/provider-service-repo.interface";
import { IProviderServiceMapper } from "@core/dto-mapper/interface/provider-service.mapper.interface";
import { IProviderServiceService } from "../interfaces/provider-service.interface";
import { CreateProviderServiceDto, UpdateProviderServiceDto } from "../../dto/provider-service.dto";
import { IResponse } from "@core/misc/response.util";
import { IProviderService, IProviderServiceUI } from "@core/entities/interfaces/provider-service.entity.interface";
import { ProviderService } from "@core/entities/implementation/provider-service.entity";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";
import { UPLOAD_UTILITY_NAME } from "@core/constants/utility.constant";
import { IUploadsUtility } from "@core/utilities/interface/upload.utility.interface";
import { UserType } from "@core/entities/interfaces/user.entity.interface";
import { UploadsType } from "@core/enum/uploads.enum";
import { IProfessionRepository } from "@core/repositories/interfaces/profession-repo.interface";
import { IServiceCategoryRepository } from "@core/repositories/interfaces/service-category-repo.interface";

@Injectable()
export class ProviderServiceService implements IProviderServiceService {
    constructor(
        @Inject(PROVIDER_SERVICE_REPOSITORY_NAME)
        private readonly _providerServiceRepository: IProviderServiceRepository,
        @Inject(PROVIDER_SERVICE_MAPPER)
        private readonly _providerServiceMapper: IProviderServiceMapper,
        @Inject(UPLOAD_UTILITY_NAME)
        private readonly _uploadUtility: IUploadsUtility,
        @Inject(PROFESSION_REPOSITORY_NAME)
        private readonly _professionRepository: IProfessionRepository,
        @Inject(SERVICE_CATEGORY_REPOSITORY_NAME)
        private readonly _categoryRepository: IServiceCategoryRepository
    ) { }

    async createService(providerId: string, userType: UserType, createServiceDto: CreateProviderServiceDto, file: Express.Multer.File): Promise<IResponse<IProviderServiceUI>> {
        if (!file) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: 'Image is required'
        });

        const isServiceExist = await this._providerServiceRepository.isServiceExistByCategoryId(providerId, createServiceDto.categoryId);
        if (isServiceExist) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: ErrorMessage.SERVICE_ALREADY_EXISTS
        });

        const publicId = this._uploadUtility.getPublicId(userType, providerId, UploadsType.SERVICE, createServiceDto.categoryId);
        let uploadResult!: string;

        try {
            const uploaded = await this._uploadUtility.uploadsImage(file, publicId);

            if (!uploaded?.url || !uploaded?.public_id) {
                throw new Error('Image upload failed');
            }

            uploadResult = uploaded.public_id;
        } catch (err) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: err.message
            });
        }

        const entity = new ProviderService({
            ...createServiceDto,
            providerId,
            isActive: createServiceDto.isActive ?? true,
            isDeleted: false,
            image: uploadResult,
        });

        const doc = this._providerServiceMapper.toDocument(entity);
        const saved = await this._providerServiceRepository.createAndPopulate(doc);

        if (!saved) throw new InternalServerErrorException({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: 'Provider service creation failed'
        });

        return {
            success: true,
            message: 'Provider service created successfully',
            data: this._providerServiceMapper.toPopulatedEntity(saved)
        }
    }

    async updateService(providerId: string, userType: UserType, serviceId: string, updateServiceDto: UpdateProviderServiceDto, file: Express.Multer.File): Promise<IResponse<IProviderServiceUI>> {
        const existing = await this._providerServiceRepository.isServiceExist(serviceId);
        if (!existing) throw new BadRequestException({
            code: ErrorCodes.NOT_FOUND,
            message: 'Provider service not found'
        });

        const updateData: Partial<IProviderService> = {};

        for (let [key, value] of Object.entries(updateServiceDto)) {
            if (value !== undefined && value !== null) {
                (updateData as any)[key] = value;
            }
        }

        if (file) {
            const publicId = this._uploadUtility.getPublicId(userType, providerId, UploadsType.SERVICE, updateServiceDto.categoryId);
            let uploadResult!: string;

            try {
                const uploaded = await this._uploadUtility.uploadsImage(file, publicId);

                if (!uploaded?.url || !uploaded?.public_id) {
                    throw new Error('Image upload failed');
                }

                uploadResult = uploaded.public_id;
            } catch (err) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: err.message
                });
            }

            updateData.image = uploadResult;
        }


        const updated = await this._providerServiceRepository.updateAndPopulateByServiceId(serviceId, updateData);

        if (!updated) throw new InternalServerErrorException({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: 'Provider service update failed'
        });

        updated.image = this._uploadUtility.getSignedImageUrl(updated.image) || '';

        return {
            success: true,
            message: 'Provider service updated successfully',
            data: this._providerServiceMapper.toPopulatedEntity(updated)
        }
    }

    async findAllByProviderId(providerId: string): Promise<IResponse<IProviderServiceUI[]>> {
        const docs = await this._providerServiceRepository.findAllAndPopulateByProviderId(providerId);

        const services: IProviderServiceUI[] = await Promise.all(
            docs.map(async doc => {
                const service = this._providerServiceMapper.toPopulatedEntity(doc);

                const enrichedService: IProviderServiceUI = {
                    id: service.id,
                    providerId,
                    profession: {
                        id: service.profession.id,
                        name: service.profession.name
                    },
                    category: {
                        id: service.category.id,
                        name: service.category.name
                    },
                    description: service.description,
                    price: service.price,
                    pricingUnit: service.pricingUnit,
                    image: this._uploadUtility.getSignedImageUrl(service.image) || '',
                    estimatedTimeInMinutes: service.estimatedTimeInMinutes,
                    isActive: service.isActive,
                    createdAt: service.createdAt,
                    updatedAt: service.updatedAt
                }
                return enrichedService;
            })
        );

        return {
            success: true,
            message: 'Provider services fetched successfully',
            data: services
        };
    }

    async toggleStatus(serviceId: string): Promise<IResponse> {
        const existing = await this._providerServiceRepository.isServiceExist(serviceId);
        if (!existing) throw new BadRequestException({
            code: ErrorCodes.NOT_FOUND,
            message: 'Provider service not found'
        });

        const updated = await this._providerServiceRepository.updateStatusByServiceId(serviceId);
        return {
            success: !!updated,
            message: 'Provider service status updated successfully.'
        };
    }

    async deleteService(serviceId: string): Promise<IResponse> {
        const deleted = await this._providerServiceRepository.deleteService(serviceId);
        if (!deleted) throw new BadRequestException({
            code: ErrorCodes.NOT_FOUND,
            message: 'Provider service not found'
        });

        return {
            success: true,
            message: 'Provider service deleted successfully'
        };
    }
}
