import { IResponse } from '@/core/misc/response.util';
import { UpdateReviewStatus } from '@modules/users/dtos/admin-user.dto';


export interface IAdminReviewService {
    updateReviewStatus(updateReviewStatus: UpdateReviewStatus): Promise<IResponse>;
    reviewOverviews(): Promise<IResponse>;
}