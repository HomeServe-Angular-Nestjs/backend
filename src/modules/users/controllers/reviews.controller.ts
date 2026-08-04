import { ADMIN_REVIEWS_SERVICE_NAME } from '@core/constants/service.constant';
import { PaginatedReviewResponse } from '@core/entities/interfaces/user.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { AdminRoleGuard } from '@core/guards/admin-role.guard';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { IResponse } from '@core/misc/response.util';
import { FilterWithPaginationDto, LowestRatedQueryDto, RatingTrendQueryDto, UpdateReviewStatus } from '@modules/users/dtos/admin-user.dto';
import { IAdminReviewService } from '@modules/users/services/interfaces/admin-reviews-service.interface';
import { Body, Controller, Get, Inject, Patch, Query, UseGuards } from '@nestjs/common';

@UseGuards(AdminRoleGuard)
@Controller('admin/reviews')
export class ReviewController {
    private readonly logger = new CustomLogger(ReviewController.name);

    constructor(
        @Inject(ADMIN_REVIEWS_SERVICE_NAME)
        private readonly _reviewService: IAdminReviewService,
    ) { }

    @Get()
    async getReviews(@Query() filter: FilterWithPaginationDto) {
        return await this._reviewService.getReviews(filter);
    }

    @Get('stats')
    async getReviewStats() {
        return await this._reviewService.reviewStats();
    }

    @Get('lowest_rated')
    async getLowestRatedProviders(@Query() query: LowestRatedQueryDto) {
        return await this._reviewService.lowestRatedProviders(query.limit);
    }

    @Get('rating_trend')
    async getRatingTrend(@Query() query: RatingTrendQueryDto) {
        return await this._reviewService.ratingTrend(query.days);
    }

    @Patch('status')
    async updateStatus(@Body() updateReviewStatus: UpdateReviewStatus) {
        return await this._reviewService.updateReviewStatus(updateReviewStatus);
    }
}

