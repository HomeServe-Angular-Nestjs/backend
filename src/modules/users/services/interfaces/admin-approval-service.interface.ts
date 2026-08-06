import {
    IApprovalOverviewData, IApprovalTableDetails, VerificationStatusType
} from '@/core/entities/interfaces/user.entity.interface';
import { IResponse } from '@/core/misc/response.util';

export interface IAdminApprovalService {
    fetchApprovalOverviewDetails(): Promise<IResponse<IApprovalOverviewData>>;
    fetchApprovalTableData(): Promise<IResponse<IApprovalTableDetails[]>>;
    updateProviderVerification(providerId: string, status: VerificationStatusType): Promise<IResponse<boolean>>;
}