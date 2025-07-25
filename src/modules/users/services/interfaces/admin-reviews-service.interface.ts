import { PaginatedReviewResponse } from '@/core/entities/interfaces/user.entity.interface';
import { IResponse } from '@/core/misc/response.util';

import { FilterWithPaginationDto, UpdateReviewStatus } from '../../dtos/admin-user.dto';

export interface IAdminReviewService {
    getReviewData(dto: FilterWithPaginationDto): Promise<IResponse<PaginatedReviewResponse>>;
    updateReviewStatus(dto: UpdateReviewStatus): Promise<IResponse>;
    reviewOverviews(): Promise<IResponse>;
}