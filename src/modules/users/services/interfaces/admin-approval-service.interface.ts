import {
    IApprovalOverviewData, IApprovalTableDetails
} from '@/core/entities/interfaces/user.entity.interface';
import { IResponse } from '@/core/misc/response.util';

export interface IAdminApprovalService {
    fetchApprovalOverviewDetails(): Promise<IResponse<IApprovalOverviewData>>;
    fetchApprovalTableData(): Promise<IResponse<IApprovalTableDetails[]>>;
}