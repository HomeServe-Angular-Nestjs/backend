import { ADMIN_REVIEWS_SERVICE_NAME } from '@core/constants/service.constant';
import { PaginatedReviewResponse } from '@core/entities/interfaces/user.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { IResponse } from '@core/misc/response.util';
import { FilterWithPaginationDto, UpdateReviewStatus } from '@modules/users/dtos/admin-user.dto';
import {
    IAdminReviewService
} from '@modules/users/services/interfaces/admin-reviews-service.interface';
import {
    Body, Controller, Get, Inject, InternalServerErrorException, Patch, Query
} from '@nestjs/common';

@Controller('admin/reviews')
export class ReviewController {
    private readonly logger = new CustomLogger(ReviewController.name);

    constructor(
        @Inject(ADMIN_REVIEWS_SERVICE_NAME)
        private readonly _reviewService: IAdminReviewService,
    ) { }


    // @Get('')
    // async getReviews(@Query() dto: FilterWithPaginationDto): Promise<IResponse<PaginatedReviewResponse>> {
    //     try {
    //         return await this._reviewService.getReviewData(dto);
    //     } catch (err) {
    //         this.logger.error('Error caught while fetching the reviews: ', err.message, err.stack);
    //         throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);

    //     }
    // }

    @Patch('status')
    async updateStatus(@Body() dto: UpdateReviewStatus) {
        try {
            return await this._reviewService.updateReviewStatus(dto);
        } catch (err) {
            this.logger.error(`Error caught while updating review status: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);

        }
    }
}
