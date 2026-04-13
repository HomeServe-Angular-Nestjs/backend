import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { PLAN_REPOSITORY_INTERFACE_NAME, PROVIDER_SERVICE_REPOSITORY_NAME, SUBSCRIPTION_REPOSITORY_NAME } from "@core/constants/repository.constant";
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
    ) { }

    async createService(providerId: string, userType: UserType, createServiceDto: CreateProviderServiceDto, file: Express.Multer.File): Promise<IResponse<IProviderServiceUI>> {

        if (!file) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: UploadErrorMessages.IMAGE_NOT_FOUND
            });
        }

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

        if (file) {
            const publicId = this._uploadUtility.getPublicId(
                userType,
                providerId,
                UploadsType.SERVICE,
                updateServiceDto.categoryId
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

        const updated = this._providerServiceMapper.toPopulatedEntity(updatedDoc)
        updated.image = this._uploadUtility.getSignedImageUrl(updated.image) || '';

        return {
            success: true,
            message: 'Provider service updated successfully',
            data: updated
        };
    }

    async findAllByProviderId(providerId: string, filters: ProviderServiceFilterDto): Promise<IResponse<IProviderServiceUI[]>> {
        const serviceDocs = await this._providerServiceRepository.findAllAndPopulateByProviderId(
            providerId,
            { search: filters.search, status: filters.status, sort: filters.sort },
            { page: parseInt(filters.page || '1'), limit: parseInt(filters.limit || '10') }
        );

        const services: IProviderServiceUI[] = (serviceDocs ?? []).map(doc => {
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
        });

        return {
            success: true,
            message: 'Provider services fetched successfully',
            data: services
        };
    }

    async toggleStatus(serviceId: string): Promise<IResponse> {
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
        const deleted = await this._providerServiceRepository.deleteService(serviceId);
        if (!deleted) throw new BadRequestException({
            code: ErrorCodes.NOT_FOUND,
            message: ErrorMessage.SERVICE_NOT_FOUND,
        });

        return {
            success: true,
            message: 'Provider service deleted successfully'
        };
    }

    async canProviderCreateService(providerId: string, userType: UserType): Promise<IResponse<boolean>> {
        const [subscriptionDoc, totalServiceCount, freePlanDoc] = await Promise.all([
            this._subscriptionRepository.findActiveSubscriptionByUserId(providerId, userType),
            this._providerServiceRepository.count({ providerId }),
            this._planRepository.findFreePlan(),
        ]);

        const features = subscriptionDoc
            ? subscriptionDoc.features
            : freePlanDoc?.features || {};

        const serviceLimit =
            features[FEATURE_REGISTRY.SERVICE_LISTING_LIMIT.key];

        if (!serviceLimit || typeof serviceLimit !== 'number') {
            throw new InternalServerErrorException({
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
                message: 'Invalid service limit configuration. Check if there is a free plan.'
            });
        }

        if (totalServiceCount >= serviceLimit) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'You’ve exceeded the service limit. Upgrade your plan to add more services.'
            });
        }

        return {
            success: true,
            message: 'Service creation allowed',
            data: true
        };
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