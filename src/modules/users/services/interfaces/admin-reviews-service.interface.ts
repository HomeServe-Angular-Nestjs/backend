import { PaginatedReviewResponse } from "src/core/entities/interfaces/user.entity.interface";
import { IResponse } from "src/core/misc/response.util";
import { FilterWithPaginationDto, UpdateReviewStatus } from "../../dtos/admin-user.dto";

export interface IAdminReviewService {
    getReviewData(dto: FilterWithPaginationDto): Promise<IResponse<PaginatedReviewResponse>>;
    updateReviewStatus(dto: UpdateReviewStatus): Promise<IResponse>;
    reviewOverviews(): Promise<IResponse>;
}