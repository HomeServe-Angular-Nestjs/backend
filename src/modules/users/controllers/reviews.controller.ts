import { Body, Controller, Get, Inject, InternalServerErrorException, Logger, Patch, Query } from "@nestjs/common";
import { ADMIN_REVIEWS_SERVICE_NAME } from "src/core/constants/service.constant";
import { ErrorMessage } from "src/core/enum/error.enum";
import { IAdminReviewService } from "../services/interfaces/admin-reviews-service.interface";
import { IResponse } from "src/core/misc/response.util";
import { FilterWithPaginationDto, UpdateReviewStatus } from "../dtos/admin-user.dto";
import { PaginatedReviewResponse } from "src/core/entities/interfaces/user.entity.interface";

@Controller('admin/reviews')
export class ReviewController {
    private readonly logger = new Logger(ReviewController.name);

    constructor(
        @Inject(ADMIN_REVIEWS_SERVICE_NAME)
        private readonly _reviewService: IAdminReviewService,
    ) { }


    @Get('')
    async getReviews(@Query() dto: FilterWithPaginationDto): Promise<IResponse<PaginatedReviewResponse>> {
        try {
            return await this._reviewService.getReviewData(dto);
        } catch (err) {
            this.logger.debug('Error caught while fetching the reviews: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);

        }
    }

    @Patch('status')
    async updateStatus(@Body() dto: UpdateReviewStatus) {
        try {
            return await this._reviewService.updateReviewStatus(dto);
        } catch (err) {
            this.logger.debug('Error caught while updating review status: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);

        }
    }
}