import { IApprovalOverviewData, IApprovalTableDetails } from "src/core/entities/interfaces/user.entity.interface";
import { IResponse } from "src/core/misc/response.util";

export interface IAdminApprovalService {
    fetchApprovalOverviewDetails(): Promise<IResponse<IApprovalOverviewData>>;
    fetchApprovalTableData(): Promise<IResponse<IApprovalTableDetails[]>>;
}