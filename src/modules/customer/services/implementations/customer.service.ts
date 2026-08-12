import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, PROVIDER_SERVICE_REPOSITORY_NAME, SERVICE_CATEGORY_REPOSITORY_NAME, SUBSCRIPTION_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { ARGON_UTILITY_NAME, UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { ICustomerSearchCategories } from '@core/entities/interfaces/service.entity.interface';
import { ICustomer, ISearchedProviders, IUpdateProfileData } from '@core/entities/interfaces/user.entity.interface';
import { ErrorCodes, ErrorMessage, UploadErrorMessages } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IResponse } from '@core/misc/response.util';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { IArgonUtility } from '@core/utilities/interface/argon.utility.interface';
import { IUploadsUtility } from '@core/utilities/interface/upload.utility.interface';
import { ChangePasswordDto } from '@modules/customer/dtos/customer.dto';
import { ICustomerService } from '@modules/customer/services/interfaces/customer-service.interface';
import { UpdateProfileDto } from '@modules/customer/dtos/customer.dto';
import { CUSTOMER_MAPPER, SERVICE_CATEGORY_MAPPER } from '@core/constants/mappers.constant';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import { UploadsType } from '@core/enum/uploads.enum';
import { IProviderServiceRepository } from '@core/repositories/interfaces/provider-service-repo.interface';
import { IServiceCategoryRepository } from '@core/repositories/interfaces/service-category-repo.interface';
import { IServiceCategoryMapper } from '@core/dto-mapper/interface/service-category.mapper.interface';
import { CustomerDocument } from '@core/schema/customer.schema';
import { ISubscriptionRepository } from '@core/repositories/interfaces/subscription-repo.interface';

@Injectable()
export class CustomerService implements ICustomerService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(ARGON_UTILITY_NAME)
        private readonly _argonUtility: IArgonUtility,
        @Inject(UPLOAD_UTILITY_NAME)
        private readonly _uploadsUtility: IUploadsUtility,
        @Inject(CUSTOMER_MAPPER)
        private readonly _customerMapper: ICustomerMapper,
        @Inject(PROVIDER_SERVICE_REPOSITORY_NAME)
        private readonly _providerServiceRepository: IProviderServiceRepository,
        @Inject(SERVICE_CATEGORY_REPOSITORY_NAME)
        private readonly _serviceCategoryRepository: IServiceCategoryRepository,
        @Inject(SERVICE_CATEGORY_MAPPER)
        private readonly _serviceCategoryMapper: IServiceCategoryMapper,
        @Inject(SUBSCRIPTION_REPOSITORY_NAME)
        private readonly _subscriptionRepository: ISubscriptionRepository,
    ) {
        this.logger = this.loggerFactory.createLogger(CustomerService.name);
    }

    async fetchOneCustomer(id: string): Promise<ICustomer | null> {
        const customerDocument = await this._customerRepository.findOne({ _id: id });
        if (!customerDocument) return null;
        return this.toEntityWithSignedAvatar(customerDocument);
    }

    private toEntityWithSignedAvatar(doc: CustomerDocument): ICustomer {
        const entity = this._customerMapper.toEntity(doc);
        entity.avatar = this._uploadsUtility.getSignedImageUrl(entity.avatar);
        return entity;
    }

    async partialUpdate(id: string, data: Partial<ICustomer>): Promise<ICustomer> {
        const updatedCustomerDocument = await this._customerRepository.partialUpdate(id, data);

        if (!updatedCustomerDocument) {
            throw new NotFoundException(`Customer with Id ${id} is not found`)
        }

        return this.toEntityWithSignedAvatar(updatedCustomerDocument);
    }

    async toggleFavorite(id: string, providerId: string): Promise<ICustomer> {
        const updatedCustomerDocument = await this._customerRepository.toggleFavorite(id, providerId);

        if (!updatedCustomerDocument) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        return this.toEntityWithSignedAvatar(updatedCustomerDocument);
    }

    async searchProviders(search: string): Promise<IResponse> {
        let result: ISearchedProviders[] = [];

        if (search) {
            const regex = new RegExp(search, 'i');
            const providers = await this._providerRepository.find(
                { address: regex },
                { sort: { createdAt: -1 } }
            );

            result = providers.map(prov => ({
                id: prov.id,
                avatar: prov.avatar,
                name: prov?.fullname ?? prov.username,
                address: prov?.address ?? ''
            }));

            const activeSubs = await this._subscriptionRepository.findActiveByUserIds(result.map(r => r.id));

            const priorityRank = new Map<string, number>();
            for (const sub of activeSubs) {
                const providerId = sub.userId.toString();
                const priority = sub.features?.search_priority as string;
                const rank = priority === 'high' ? 0 : priority === 'medium' ? 1 : priority === 'low' ? 2 : 3;
                const current = priorityRank.get(providerId);
                if (current === undefined || rank < current) {
                    priorityRank.set(providerId, rank);
                }
            }

            result = result.sort((a, b) => {
                const rankA = priorityRank.get(a.id) ?? 3;
                const rankB = priorityRank.get(b.id) ?? 3;
                return rankA - rankB;
            });
        }

        return {
            success: true,
            message: 'success',
            data: result
        }
    }

    async updateProfile(customerId: string, updateData: UpdateProfileDto): Promise<IResponse<ICustomer>> {
        const profileData: IUpdateProfileData = {
            fullname: updateData.fullname,
            username: updateData.username,
            phone: updateData.phone,
            address: updateData.address,
            coordinates: updateData.coordinates as [number, number],
        };

        const updatedCustomer = await this._customerRepository.updateProfile(customerId, profileData);

        if (!updatedCustomer) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: ErrorMessage.USER_NOT_FOUND
            });
        }

        return {
            success: !!updatedCustomer,
            message: 'update successful',
            data: this.toEntityWithSignedAvatar(updatedCustomer)
        }
    }

    async changePassword(customerId: string, data: ChangePasswordDto): Promise<IResponse<ICustomer>> {
        const customer = await this._customerRepository.findById(customerId);
        if (!customer) {
            throw new NotFoundException(ErrorMessage.CUSTOMER_NOT_FOUND_WITH_ID, customerId);
        }

        if (customer.googleId || !customer.password) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Password change is not available for Google-authenticated accounts.'
            });
        }

        const result = await this._argonUtility.verify(customer.password, data.currentPassword);
        if (!result) {
            return {
                success: false,
                message: 'Incorrect current password.'
            }
        }

        const hashedPassword = await this._argonUtility.hash(data.newPassword);

        const updatedCustomer = await this._customerRepository.updatePasswordById(customerId, hashedPassword);

        if (!updatedCustomer) {
            throw new Error('Failed to update password');
        }

        return {
            success: !!updatedCustomer,
            message: 'password changed successfully',
            data: this.toEntityWithSignedAvatar(updatedCustomer)
        }
    }

    async changeAvatar(customerId: string, file: Express.Multer.File): Promise<IResponse<ICustomer>> {
        const publicId = this._uploadsUtility.getPublicId('customer', customerId, UploadsType.USER, uuidv4());

        const uploadResponse = await this._uploadsUtility.uploadsImage(file, publicId);

        if (!uploadResponse) {
            throw new InternalServerErrorException(UploadErrorMessages.IMAGE_UPLOAD_FAILED);
        }

        const updatedCustomer = await this._customerRepository.updateAvatar(customerId, uploadResponse.public_id);

        if (!updatedCustomer) {
            throw new NotFoundException(ErrorMessage.CUSTOMER_NOT_FOUND_WITH_ID, customerId);
        }

        return {
            success: !!updatedCustomer,
            message: 'image updated',
            data: this.toEntityWithSignedAvatar(updatedCustomer)
        }
    }

    // async submitReview(customerId: string, dto: SubmitReviewDto): Promise<IResponse<IFetchReviews>> {
    //     const review: IReview = {
    //         desc: dto.desc,
    //         isReported: false,
    //         reviewedBy: customerId,
    //         writtenAt: new Date(),
    //         rating: dto.ratings,
    //         isActive: true,
    //     };

    //     const currentRating = await this._providerRepository.getCurrentRatingCountAndAverage(dto.providerId);

    //     if (!currentRating) {
    //         throw new NotFoundException('Current rating not found.');
    //     }

    //     const newRatingCount = currentRating.currentRatingCount + 1;
    //     const newAverageRating = (currentRating.currentRatingAvg * currentRating.currentRatingCount + dto.ratings) / newRatingCount;

    //     const [updatedProvider, updatedCustomer] = await Promise.all([
    //         this._providerRepository.findOneAndUpdate(
    //             { _id: dto.providerId },
    //             {
    //                 $set: {
    //                     ratingCount: newRatingCount,
    //                     avgRating: newAverageRating
    //                 },
    //                 $push: {
    //                     reviews: { $each: [review] }
    //                 }
    //             },
    //             { new: true }
    //         ),

    //         this._customerRepository.findOneAndUpdate(
    //             { _id: customerId },
    //             { $set: { isReviewed: true } },
    //             { new: true }
    //         )
    //     ]);

    //     if (!updatedProvider) {
    //         throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    //     }

    //     if (!updatedCustomer) {
    //         throw new NotFoundException(ErrorMessage.CUSTOMER_NOT_FOUND_WITH_ID, customerId);
    //     }

    //     const enrichedReview: IFetchReviews = {
    //         avatar: updatedCustomer.avatar,
    //         name: updatedCustomer.fullname ?? updatedCustomer.username,
    //         avgRating: newAverageRating,
    //         desc: review.desc,
    //         writtenAt: review.writtenAt,
    //     }

    //     return {
    //         success: true,
    //         message: 'Review Submitted successfully.',
    //         data: enrichedReview
    //     }
    // }

    async getProviderGalleryImages(providerId: string): Promise<IResponse<string[]>> {
        const workImages = await this._providerRepository.getWorkImages(providerId);
        const urls = workImages.map(imageUrl => this._uploadsUtility.getSignedImageUrl(imageUrl, 5));

        return {
            success: true,
            message: 'successfully fetched',
            data: urls ?? []
        }
    }
}
