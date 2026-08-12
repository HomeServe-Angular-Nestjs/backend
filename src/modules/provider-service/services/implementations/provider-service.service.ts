import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { PLAN_REPOSITORY_INTERFACE_NAME, PROFESSION_REPOSITORY_NAME, PROVIDER_SERVICE_REPOSITORY_NAME, SERVICE_CATEGORY_REPOSITORY_NAME, SUBSCRIPTION_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { PROVIDER_SERVICE_MAPPER } from "@core/constants/mappers.constant";
import { IProviderServiceRepository } from "@core/repositories/interfaces/provider-service-repo.interface";
import { IProviderServiceMapper } from "@core/dto-mapper/interface/provider-service.mapper.interface";
import { IProviderServiceService } from "../interfaces/provider-service.interface";
import { CreateProviderServiceDto, UpdateProviderServiceDto, ProviderServiceFilterDto } from "../../dto/provider-service.dto";
import { IResponse } from "@core/misc/response.util";
import { IProviderService, IProviderServiceUI } from "@core/entities/interfaces/provider-service.entity.interface";
import { ProviderService } from "@core/entities/implementation/provider-service.entity";
import { ErrorCodes, ErrorMessage, UploadErrorCodes, UploadErrorMessages } from "@core/enum/error.enum";
import { UPLOAD_UTILITY_NAME } from "@core/constants/utility.constant";
import { IUploadsUtility } from "@core/utilities/interface/upload.utility.interface";
import { UserType } from "@core/entities/interfaces/user.entity.interface";
import { UploadsType } from "@core/enum/uploads.enum";
import { ISubscriptionRepository } from "@core/repositories/interfaces/subscription-repo.interface";
import { FEATURE_REGISTRY } from "@modules/plans/registry/feature.registry";
import { IPlanRepository } from "@core/repositories/interfaces/plans-repo.interface";
import { ProviderServicePopulatedDocument } from "@core/schema/provider-service.schema";
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
        @Inject(PLAN_REPOSITORY_INTERFACE_NAME)
        private readonly _planRepository: IPlanRepository,
        @Inject(SUBSCRIPTION_REPOSITORY_NAME)
        private readonly _subscriptionRepository: ISubscriptionRepository,
        @Inject(PROFESSION_REPOSITORY_NAME)
        private readonly _professionRepository: IProfessionRepository,
        @Inject(SERVICE_CATEGORY_REPOSITORY_NAME)
        private readonly _serviceCategoryRepository: IServiceCategoryRepository,
    ) { }

    async createService(providerId: string, userType: UserType, createServiceDto: CreateProviderServiceDto, file: Express.Multer.File): Promise<IResponse<IProviderServiceUI>> {

        await this.canProviderCreateService(providerId, userType);

        if (!file) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: UploadErrorMessages.IMAGE_NOT_FOUND
            });
        }

        await this._validateCategoryAndProfession(createServiceDto.categoryId, createServiceDto.professionId);

        const publicId = this._uploadUtility.getPublicId(
            userType,
            providerId,
            UploadsType.SERVICE,
            createServiceDto.categoryId
        );

        const uploadResult = await this._handleImageUpload(file, publicId);

        const entity = new ProviderService({
            ...createServiceDto,
            providerId,
            isActive: createServiceDto.isActive ?? true,
            isDeleted: false,
            image: uploadResult,
        });

        const doc = this._providerServiceMapper.toDocument(entity);

        let newServiceDoc: ProviderServicePopulatedDocument | null = null;
        try {
            newServiceDoc = await this._providerServiceRepository.createAndPopulate(doc);

        } catch (err: any) {

            // Duplicate key
            if (err?.code === 11000) {
                await this._uploadUtility.deleteImageByPublicId(uploadResult);
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: ErrorMessage.SERVICE_ALREADY_EXISTS
                });
            }

            await this._uploadUtility.deleteImageByPublicId(uploadResult);

            throw new InternalServerErrorException({
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
                message: ErrorMessage.SERVICE_CREATION_FAILED
            });
        }

        if (!newServiceDoc) {
            await this._uploadUtility.deleteImageByPublicId(uploadResult);
            throw new InternalServerErrorException({
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
                message: ErrorMessage.SERVICE_CREATION_FAILED
            });
        }

        const newService = this._providerServiceMapper.toPopulatedEntity(newServiceDoc);
        newService.image = this._uploadUtility.getSignedImageUrl(newService.image);

        return {
            success: true,
            message: 'Provider service created successfully',
            data: newService
        };
    }

    async updateService(providerId: string, userType: UserType, serviceId: string, updateServiceDto: UpdateProviderServiceDto, file: Express.Multer.File): Promise<IResponse<IProviderServiceUI>> {
        const updateData = Object.fromEntries(
            Object.entries(updateServiceDto)
                .filter(([_, value]) => value !== undefined && value !== null)
        ) as Partial<IProviderService>;

        let categoryId = updateServiceDto.categoryId;
        let professionId = updateServiceDto.professionId;
        let existing: ProviderServicePopulatedDocument | null = null;

        if (updateServiceDto.categoryId || updateServiceDto.professionId || file) {
            if (!categoryId || !professionId) {
                existing = await this._providerServiceRepository.findOneAndPopulateById(serviceId);
                if (!existing) {
                    throw new BadRequestException({
                        code: ErrorCodes.NOT_FOUND,
                        message: ErrorMessage.SERVICE_NOT_FOUND,
                    });
                }
                const populated = this._providerServiceMapper.toPopulatedEntity(existing);
                categoryId = categoryId ?? populated.category.id;
                professionId = professionId ?? populated.profession.id;
            }

            if (updateServiceDto.categoryId || updateServiceDto.professionId) {
                await this._validateCategoryAndProfession(categoryId!, professionId!);
            }
        }

        let previousImage: string | null = null;
        if (file) {
            if (!existing) {
                existing = await this._providerServiceRepository.findOneAndPopulateById(serviceId);
                if (!existing) {
                    throw new BadRequestException({
                        code: ErrorCodes.NOT_FOUND,
                        message: ErrorMessage.SERVICE_NOT_FOUND,
                    });
                }
            }

            const populated = this._providerServiceMapper.toPopulatedEntity(existing);
            previousImage = populated.image || null;
            categoryId = categoryId ?? populated.category.id;

            const publicId = this._uploadUtility.getPublicId(
                userType,
                providerId,
                UploadsType.SERVICE,
                categoryId!
            );

            updateData.image = await this._handleImageUpload(file, publicId);
        }

        const updatedDoc = await this._providerServiceRepository.updateAndPopulateByServiceId(serviceId, updateData);

        if (!updatedDoc) {
            throw new InternalServerErrorException({
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
                message: 'Provider service update failed'
            });
        }

        if (previousImage && updateData.image && previousImage !== updateData.image) {
            await this._uploadUtility.deleteImageByPublicId(previousImage);
        }

        const updated = this._providerServiceMapper.toPopulatedEntity(updatedDoc)
        updated.image = this._uploadUtility.getSignedImageUrl(updated.image) || '';

        return {
            success: true,
            message: 'Provider service updated successfully',
            data: updated
        };
    }

    async findAllByProviderId(providerId: string, filters: ProviderServiceFilterDto): Promise<IResponse<IProviderServiceUI[]>> {
        const page = Math.max(1, parseInt(filters.page || '1', 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(filters.limit || '10', 10) || 10));

        const { services: serviceDocs, total } = await this._providerServiceRepository.findAllAndPopulateByProviderId(
            providerId,
            { search: filters.search, status: filters.status, sort: filters.sort },
            { page, limit }
        );

        const services: IProviderServiceUI[] = (serviceDocs ?? []).map(doc => {
            const service = this._providerServiceMapper.toPopulatedEntity(doc);

            const enrichedService: IProviderServiceUI = {
                id: service.id,
                providerId,
                profession: {
                    id: service.profession.id,
                    name: service.profession.name,
                    isActive: service.profession.isActive
                },
                category: {
                    id: service.category.id,
                    name: service.category.name,
                    keywords: service.category.keywords ?? [],
                    isActive: service.category.isActive
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
        });

        return {
            success: true,
            message: 'Provider services fetched successfully',
            data: services,
            meta: { total }
        };
    }

    async toggleStatus(serviceId: string): Promise<IResponse> {
        const service = await this._providerServiceRepository.findOneAndPopulateById(serviceId);
        if (!service) throw new BadRequestException({
            code: ErrorCodes.NOT_FOUND,
            message: ErrorMessage.SERVICE_NOT_FOUND,
        });

        if (
            service.isActive === false &&
            (service.categoryId?.isActive === false || service.professionId?.isActive === false)
        ) {
            throw new BadRequestException({
                code: ErrorCodes.SERVICE_ACTIVATION_BLOCKED,
                message: ErrorMessage.SERVICE_ACTIVATION_BLOCKED
            });
        }

        const updated = await this._providerServiceRepository.updateStatusByServiceId(serviceId);
        if (!updated) throw new BadRequestException({
            code: ErrorCodes.NOT_FOUND,
            message: ErrorMessage.SERVICE_NOT_FOUND,
        });

        return {
            success: !!updated,
            message: 'Provider service status updated successfully.'
        };
    }

    async deleteService(serviceId: string): Promise<IResponse> {
        const existing = await this._providerServiceRepository.findOneAndPopulateById(serviceId);
        if (!existing) throw new BadRequestException({
            code: ErrorCodes.NOT_FOUND,
            message: ErrorMessage.SERVICE_NOT_FOUND,
        });

        const deleted = await this._providerServiceRepository.deleteService(serviceId);
        if (!deleted) throw new BadRequestException({
            code: ErrorCodes.NOT_FOUND,
            message: ErrorMessage.SERVICE_NOT_FOUND,
        });

        const image = this._providerServiceMapper.toPopulatedEntity(existing).image;
        if (image) {
            await this._uploadUtility.deleteImageByPublicId(image);
        }

        return {
            success: true,
            message: 'Provider service deleted successfully'
        };
    }

    async canProviderCreateService(providerId: string, userType: UserType): Promise<IResponse<boolean>> {
        const DEFAULT_SERVICE_LIMIT = 5;

        const [subscriptionDoc, totalServiceCount, freePlanDoc] = await Promise.all([
            this._subscriptionRepository.findActiveSubscriptionByUserId(providerId, userType),
            this._providerServiceRepository.count({ providerId }),
            this._planRepository.findFreePlan(),
        ]);

        const features = (subscriptionDoc?.features || freePlanDoc?.features || {}) as Record<string, unknown>;
        const configuredLimit = features[FEATURE_REGISTRY.SERVICE_LISTING_LIMIT.key];

        const serviceLimit =
            typeof configuredLimit === 'number' && configuredLimit > 0
                ? configuredLimit
                : DEFAULT_SERVICE_LIMIT;

        if (totalServiceCount >= serviceLimit) {
            throw new BadRequestException({
                code: ErrorCodes.SERVICE_LIMIT_EXCEEDED,
                message: 'You’ve exceeded the service limit. Upgrade your plan to add more services.'
            });
        }

        return {
            success: true,
            message: 'Service creation allowed',
            data: true
        };
    }

    private async _validateCategoryAndProfession(categoryId: string, professionId: string): Promise<void> {
        const [profession, category] = await Promise.all([
            this._professionRepository.findById(professionId),
            this._serviceCategoryRepository.findById(categoryId),
        ]);

        if (!profession || profession.isDeleted || !profession.isActive) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.PROFESSION_NOT_AVAILABLE
            });
        }

        if (!category || category.isDeleted || !category.isActive) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.SERVICE_CATEGORY_NOT_AVAILABLE
            });
        }

        if (category.professionId.toString() !== professionId) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.CATEGORY_PROFESSION_MISMATCH
            });
        }
    }

    private async _handleImageUpload(file: Express.Multer.File, publicId: string): Promise<string> {

        try {
            const uploaded = await this._uploadUtility.uploadsImage(file, publicId);

            if (!uploaded?.public_id) {
                throw new Error(UploadErrorCodes.EMPTY_RESULT);
            }

            return uploaded.public_id;

        } catch (err: any) {

            switch (err?.message) {

                case UploadErrorCodes.INVALID_FILE_TYPE:
                    throw new BadRequestException({
                        code: UploadErrorCodes.INVALID_FILE_TYPE,
                        message: UploadErrorMessages.INVALID_FILE_TYPE
                    });

                case UploadErrorCodes.NETWORK_FAILURE:
                    throw new ServiceUnavailableException({
                        code: UploadErrorCodes.NETWORK_FAILURE,
                        message: UploadErrorMessages.NETWORK_FAILURE
                    });

                case UploadErrorCodes.UPLOAD_PROVIDER_ERROR:
                    throw new BadRequestException({
                        code: UploadErrorCodes.UPLOAD_PROVIDER_ERROR,
                        message: UploadErrorMessages.UPLOAD_PROVIDER_ERROR
                    });

                default:
                    throw new InternalServerErrorException({
                        code: UploadErrorCodes.UPLOAD_UNKNOWN_ERROR,
                        message: UploadErrorMessages.UPLOAD_UNKNOWN_ERROR
                    });
            }
        }
    }
}