import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SERVICE_OFFERED_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { ARGON_UTILITY_NAME, UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { ICustomerSearchServices } from '@core/entities/interfaces/service.entity.interface';
import { ICustomer, ISearchedProviders } from '@core/entities/interfaces/user.entity.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IResponse } from '@core/misc/response.util';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { IServiceOfferedRepository } from '@core/repositories/interfaces/serviceOffered-repo.interface';
import { IArgonUtility } from '@core/utilities/interface/argon.utility.interface';
import { IUploadsUtility } from '@core/utilities/interface/upload.utility.interface';
import { ChangePasswordDto } from '@modules/customer/dtos/customer.dto';
import { ICustomerService } from '@modules/customer/services/interfaces/customer-service.interface';
import { UpdateProfileDto, UpdateSavedProvidersDto } from '@modules/customer/dtos/customer.dto';
import { CUSTOMER_MAPPER } from '@core/constants/mappers.constant';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import { UploadsType } from '@core/enum/uploads.enum';

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
        @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
        private readonly _serviceOfferedRepository: IServiceOfferedRepository,
        @Inject(CUSTOMER_MAPPER)
        private readonly _customerMapper: ICustomerMapper,
    ) {
        this.logger = this.loggerFactory.createLogger(CustomerService.name);
    }

    async fetchOneCustomer(id: string): Promise<ICustomer | null> {
        const customerDocument = await this._customerRepository.findOne({ _id: id });
        if (!customerDocument) return null;
        const customer = this._customerMapper.toEntity(customerDocument);
        customer.avatar = customer?.avatar ? this._uploadsUtility.getSignedImageUrl(customer.avatar) : ''; //!Todo handle google image
        console.log(customer);
        return customer;
    }

    async partialUpdate(id: string, data: Partial<ICustomer>): Promise<ICustomer> {
        const updatedCustomerDocument = await this._customerRepository.findOneAndUpdate(
            { _id: id },
            { $set: data },
            { new: true }
        );

        if (!updatedCustomerDocument) {
            throw new NotFoundException(`Customer with Id ${id} is not found`)
        }

        return this._customerMapper.toEntity(updatedCustomerDocument);
    }

    async updateSavedProviders(id: string, dto: UpdateSavedProvidersDto): Promise<ICustomer> {
        const customers = await this._customerRepository.findById(id);
        const alreadySaved = customers?.savedProviders?.includes(dto.providerId);

        const query = alreadySaved
            ? { $pull: { savedProviders: dto.providerId } }
            : { $addToSet: { savedProviders: dto.providerId } };

        const updatedCustomerDocument = await this._customerRepository.findOneAndUpdate(
            { _id: id },
            query,
            { new: true }
        );

        if (!updatedCustomerDocument) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        return this._customerMapper.toEntity(updatedCustomerDocument);
    }

    async searchProviders(search: string): Promise<IResponse> {
        let result: ISearchedProviders[] = [];

        if (search) {
            const regex = new RegExp(search, 'i');
            const providers = await this._providerRepository.find({ address: regex });

            result = providers.map(prov => ({
                id: prov.id,
                avatar: prov.avatar,
                name: prov?.fullname ?? prov.username,
                address: prov?.address ?? ''
            }));
        }

        return {
            success: true,
            message: 'success',
            data: result
        }
    }

    async updateProfile(customerId: string, updateData: UpdateProfileDto): Promise<IResponse<ICustomer>> {
        const updatedCustomer = await this._customerRepository.findOneAndUpdate(
            { _id: customerId },
            {
                $set: {
                    location: {
                        coordinates: updateData.coordinates,
                        type: 'Point'
                    },
                    ...updateData
                }
            },
            { new: true }
        );

        if (!updatedCustomer) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: ErrorMessage.USER_NOT_FOUND
            });
        }

        return {
            success: !!updatedCustomer,
            message: 'update successful',
            data: this._customerMapper.toEntity(updatedCustomer)
        }
    }

    async changePassword(customerId: string, data: ChangePasswordDto): Promise<IResponse<ICustomer>> {
        const customer = await this._customerRepository.findById(customerId);
        if (!customer) {
            throw new NotFoundException(ErrorMessage.CUSTOMER_NOT_FOUND_WITH_ID, customerId);
        }

        const result = await this._argonUtility.verify(customer.password, data.currentPassword);
        if (!result) {
            return {
                success: false,
                message: 'Incorrect current password.'
            }
        }

        const hashedPassword = await this._argonUtility.hash(data.newPassword);

        const updatedCustomer = await this._customerRepository.findOneAndUpdate(
            { _id: customerId },
            {
                $set: { password: hashedPassword }
            },
            { new: true }
        );

        if (!updatedCustomer) {
            throw new Error('Failed to update password');
        }

        return {
            success: !!updatedCustomer,
            message: 'password changed successfully',
            data: this._customerMapper.toEntity(updatedCustomer)
        }
    }

    async changeAvatar(customerId: string, file: Express.Multer.File): Promise<IResponse<ICustomer>> {
        const publicId = this._uploadsUtility.getPublicId('customer', customerId, UploadsType.USER, uuidv4());

        const uploadResponse = await this._uploadsUtility.uploadsImage(file, publicId);

        if (!uploadResponse) {
            throw new InternalServerErrorException(ErrorMessage.FILE_UPLOAD_FAILED);
        }

        const updatedCustomer = await this._customerRepository.findOneAndUpdate(
            { _id: customerId },
            {
                $set: { avatar: uploadResponse.public_id }
            },
            { nw: true }
        );

        if (!updatedCustomer) {
            throw new NotFoundException(ErrorMessage.CUSTOMER_NOT_FOUND_WITH_ID, customerId);
        }

        return {
            success: !!updatedCustomer,
            message: 'image updated',
            data: this._customerMapper.toEntity(updatedCustomer)
        }
    }

    async searchServices(search: string): Promise<IResponse<ICustomerSearchServices[]>> {
        if (!search.trim()) {
            return {
                success: true,
                message: 'empty search.',
                data: []
            };
        }

        const services = await this._serviceOfferedRepository.find({
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { 'subService.title': { $regex: search, $options: 'i' } }
            ],
            isDeleted: false,
            isActive: true
        });

        if (services.length === 0) {
            return {
                success: true,
                message: 'No services matched your search.',
                data: []
            };
        }

        const serviceIdSet = new Set(services.map(s => s.id));

        const providers = await this._providerRepository.find({
            servicesOffered: { $in: [...serviceIdSet].map(id => new Types.ObjectId(id)) }
        });

        const serviceToProviderMap = new Map<string, { providerId: string; offeredServiceIds: string[] }>();

        for (const provider of providers) {
            const offeredServiceIds = provider.servicesOffered.map(id => id.toString());

            for (const serviceId of offeredServiceIds) {
                if (serviceIdSet.has(serviceId) && !serviceToProviderMap.has(serviceId)) {
                    serviceToProviderMap.set(serviceId, {
                        providerId: provider.id,
                        offeredServiceIds
                    });
                }
            }
        }

        const filteredServices = services.map(service => {
            const providerData = serviceToProviderMap.get(service.id);

            return {
                id: service.id,
                title: service.title,
                image: service.image,
                provider: providerData?.providerId as string,
                offeredServiceIds: providerData?.offeredServiceIds ?? []
            };
        });

        return {
            success: true,
            message: 'Services fetched successfully',
            data: filteredServices
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
