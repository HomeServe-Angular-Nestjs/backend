import { IReviewFilters } from '@/core/entities/interfaces/user.entity.interface';
import { IResponse } from '@/core/misc/response.util';
import { UpdateReviewStatus } from '@modules/users/dtos/admin-user.dto';


export interface IAdminReviewService {
    getReviews(filter: IReviewFilters): Promise<IResponse>;
    updateReviewStatus(updateReviewStatus: UpdateReviewStatus): Promise<IResponse>;
    reviewStats(): Promise<IResponse>;
}
