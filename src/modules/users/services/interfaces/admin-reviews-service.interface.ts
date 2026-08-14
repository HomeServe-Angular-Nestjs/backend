import type { IReviewFilters } from '@/core/entities/interfaces/user.entity.interface';
import type { IResponse } from '@/core/misc/response.util';
import type { UpdateReviewStatus } from '@modules/users/dtos/admin-user.dto';

export interface IAdminReviewService {
  getReviews(filter: IReviewFilters): Promise<IResponse>;
  updateReviewStatus(updateReviewStatus: UpdateReviewStatus): Promise<IResponse>;
  reviewStats(): Promise<IResponse>;
  lowestRatedProviders(limit?: number): Promise<IResponse>;
  ratingTrend(days?: number): Promise<IResponse>;
}
