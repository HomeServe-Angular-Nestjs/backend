import { ADMIN_REVIEWS_SERVICE_NAME } from '@core/constants/service.constant';
import { PaginatedReviewResponse } from '@core/entities/interfaces/user.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { IResponse } from '@core/misc/response.util';
import { FilterWithPaginationDto, UpdateReviewStatus } from '@modules/users/dtos/admin-user.dto';
import { IAdminReviewService } from '@modules/users/services/interfaces/admin-reviews-service.interface';
import { Body, Controller, Get, Inject, Patch, Query } from '@nestjs/common';

@Controller('admin/reviews')
export class ReviewController {
    private readonly logger = new CustomLogger(ReviewController.name);

    constructor(
        @Inject(ADMIN_REVIEWS_SERVICE_NAME)
        private readonly _reviewService: IAdminReviewService,
    ) { }

    @Patch('status')
    async updateStatus(@Body() updateReviewStatus: UpdateReviewStatus) {
        return await this._reviewService.updateReviewStatus(updateReviewStatus);
    }
}
