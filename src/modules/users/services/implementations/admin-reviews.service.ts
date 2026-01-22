import { BOOKING_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { IReviewFilters } from '@core/entities/interfaces/user.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { IResponse } from '@core/misc/response.util';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IAdminReviewService } from '@modules/users/services/interfaces/admin-reviews-service.interface';
import { UpdateReviewStatus } from '@modules/users/dtos/admin-user.dto';
import { UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { IUploadsUtility } from '@core/utilities/interface/upload.utility.interface';

@Injectable()
export class AdminReviewService implements IAdminReviewService {
    constructor(
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(UPLOAD_UTILITY_NAME)
        private readonly _uploadUtility: IUploadsUtility
    ) { }

    async getReviews(filter: IReviewFilters): Promise<IResponse> {
        try {
            const result = await this._bookingRepository.getAdminReviews(filter);

            for (let review of result.reviews) {
                review.providerAvatar = this._uploadUtility.getSignedImageUrl(review.providerAvatar);
                review.reviewedBy.customerAvatar = this._uploadUtility.getSignedImageUrl(review.reviewedBy.customerAvatar);
            }

            return {
                success: true,
                message: 'Reviews fetched successfully',
                data: result
            };
        } catch (error) {
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    async updateReviewStatus(updateReviewStatus: UpdateReviewStatus): Promise<IResponse> {
        const isUpdated = await this._bookingRepository.updateReviewStatus(updateReviewStatus.reviewId, updateReviewStatus.status);

        if (!isUpdated) {
            throw new NotFoundException('Review not found or could not be updated');
        }

        return {
            success: true,
            message: updateReviewStatus.status ? 'Review Successfully activated.' : 'Review Successfully inactivated.'
        }
    }

    async reviewStats(): Promise<IResponse> {
        try {
            const stats = await this._bookingRepository.getAdminReviewStats();
            return {
                success: true,
                message: 'Review stats fetched successfully',
                data: stats
            };
        } catch (error) {
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }
}
