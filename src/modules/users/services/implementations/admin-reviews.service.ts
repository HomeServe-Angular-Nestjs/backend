import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';

import { ErrorMessage } from '@core/enum/error.enum';
import { IResponse } from '@core/misc/response.util';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { UpdateReviewStatus } from '../../dtos/admin-user.dto';
import { IAdminReviewService } from '../interfaces/admin-reviews-service.interface';
import { PROVIDER_MAPPER } from '@core/constants/mappers.constant';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';

@Injectable()
export class AdminReviewService implements IAdminReviewService {
    constructor(
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_MAPPER)
        private readonly _providerMapper: IProviderMapper,
    ) { }


    // async getReviewData(dto: FilterWithPaginationDto): Promise<IResponse<PaginatedReviewResponse>> {
    //     const page = 1;
    //     const limit = 10;
    //     const skip = (page - 1) * limit;

    //     // Get providers who have reviews
    //     const providersWithReviewDocuments = await this._providerRepository.find({ 'reviews.0': { $exists: true } });
    //     const providersWithReviews = (providersWithReviewDocuments ?? []).map(provider => this._providerMapper.toEntity(provider))

    //     // Flatten all reviews with their associated provider
    //     const allReviews: { review: IReview, provider: IProvider }[] = [];

    //     for (const provider of providersWithReviews) {
    //         for (const review of provider.reviews) {
    //             allReviews.push({ review, provider });
    //         }
    //     }

    //     // Apply rating filter
    //     const minRating = Number(dto.minRating) || 0;
    //     let filteredReviews = allReviews.filter(r => r.review.rating >= minRating);

    //     // Apply search
    //     if (dto.search && dto.searchBy) {
    //         const search = dto.search.toLowerCase();

    //         switch (dto.searchBy) {
    //             case RatingSearchBy.ReviewId:
    //                 filteredReviews = filteredReviews.filter(r =>
    //                     r.review.id?.toLowerCase().includes(search)
    //                 );
    //                 break;

    //             case RatingSearchBy.Provider:
    //                 filteredReviews = filteredReviews.filter(r =>
    //                     r.provider.fullname?.toLowerCase().includes(search) ||
    //                     r.provider.username?.toLowerCase().includes(search) ||
    //                     r.provider.email?.toLowerCase().includes(search)
    //                 );
    //                 break;

    //             case RatingSearchBy.Content:
    //                 filteredReviews = filteredReviews.filter(r =>
    //                     r.review.desc?.toLowerCase().includes(search)
    //                 );
    //                 break;

    //             default:
    //                 break;
    //         }
    //     }

    //     // Apply sorting
    //     switch (dto.sortBy) {
    //         case RatingsSortBy.Highest:
    //             filteredReviews.sort((a, b) => b.review.rating - a.review.rating);
    //             break;
    //         case RatingsSortBy.Lowest:
    //             filteredReviews.sort((a, b) => a.review.rating - b.review.rating);
    //             break;
    //         case RatingsSortBy.Oldest:
    //             filteredReviews.sort((a, b) =>
    //                 new Date(a.review.writtenAt).getTime() - new Date(b.review.writtenAt).getTime()
    //             );
    //             break;
    //         case RatingsSortBy.Latest:
    //         default:
    //             filteredReviews.sort((a, b) =>
    //                 new Date(b.review.writtenAt).getTime() - new Date(a.review.writtenAt).getTime()
    //             );
    //     }

    //     // Paginate filtered data
    //     const paginated = filteredReviews.slice(skip, skip + limit);

    //     // Enrich each review with customer info
    //     const enrichedReviews: IAdminReviewData[] = await Promise.all(
    //         paginated.map(async ({ review, provider }) => {
    //             const customer = await this._customerRepository.findById(review.reviewedBy);
    //             if (!customer) {
    //                 throw new NotFoundException(ErrorMessage.CUSTOMER_NOT_FOUND_WITH_ID, review.reviewedBy);
    //             }

    //             return {
    //                 reviewId: review.id as string,
    //                 reviewedBy: {
    //                     customerId: customer.id,
    //                     customerName: customer.fullname || customer.username,
    //                     customerEmail: customer.email,
    //                     customerAvatar: customer.avatar,
    //                 },
    //                 providerId: provider.id,
    //                 providerName: provider.fullname || provider.username,
    //                 providerEmail: provider.email,
    //                 providerAvatar: provider.avatar,
    //                 isReported: review.isReported,
    //                 desc: review.desc,
    //                 rating: review.rating,
    //                 writtenAt: review.writtenAt,
    //                 isActive: review.isActive,
    //             };
    //         })
    //     );

    //     // Return paginated response
    //     return {
    //         success: true,
    //         message: 'Review data successfully fetched',
    //         data: {
    //             reviews: enrichedReviews,
    //             pagination: {
    //                 total: filteredReviews.length,
    //                 page,
    //                 limit,
    //                 // totalPages: Math.ceil(filteredReviews.length / limit),
    //             },
    //         },
    //     };
    // }

    async updateReviewStatus(dto: UpdateReviewStatus): Promise<IResponse> {
        const updatedProvider = await this._providerRepository.findOneAndUpdate(
            {
                _id: dto.providerId,
                'reviews._id': dto.reviewId,
            },
            {
                $set: {
                    'reviews.$.isActive': !dto.status
                }
            },
            { new: true }
        );

        if (!updatedProvider) {
            throw new NotFoundException(ErrorMessage.PROVIDER_NOT_FOUND_WITH_ID, dto.providerId);

        }

        return {
            success: true,
            message: dto.status ? 'Review Successfully inactivated.' : 'Review Successfully activated.'
        }
    }

    async reviewOverviews(): Promise<IResponse> {



        return {
            success: true,
            message: 'successfully fetched'
        }
    }
}