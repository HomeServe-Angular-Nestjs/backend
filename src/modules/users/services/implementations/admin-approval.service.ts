import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { IAdminApprovalService } from "../interfaces/admin-approval-service.interface";
import { IResponse } from "src/core/misc/response.util";
import { IProviderRepository } from "src/core/repositories/interfaces/provider-repo.interface";
import { PROVIDER_REPOSITORY_INTERFACE_NAME } from "src/core/constants/repository.constant";
import { ErrorMessage } from "src/core/enum/error.enum";
import { IApprovalOverviewData, IApprovalTableDetails, IProvider, VerificationStatusType } from "src/core/entities/interfaces/user.entity.interface";

@Injectable()
export class AdminApprovalService implements IAdminApprovalService {
    private readonly logger = new Logger(AdminApprovalService.name);

    constructor(
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository
    ) { }

    async fetchApprovalOverviewDetails(): Promise<IResponse<IApprovalOverviewData>> {
        const providers = await this._providerRepository.find({ isDeleted: false });
        const total = providers.length;

        if (!providers || !total) {
            return {
                success: true,
                message: 'list is empty'
            }
        }

        const countByStatus = (data: IProvider[], status: VerificationStatusType): number =>
            data.filter(p => p.verificationStatus === status).length;

        const getShareOfTotal = (count: number, total: number): string => {
            if (total === 0) return '0%';
            return `${((count / total) * 100).toFixed(1)}%`;
        };

        const pending = countByStatus(providers, 'pending');
        const verified = countByStatus(providers, 'verified');
        const rejected = countByStatus(providers, 'rejected');

        return {
            success: true,
            message: "details fetched",
            data: {
                pending: {
                    count: pending,
                    percentage: getShareOfTotal(pending, total)
                },
                verified: {
                    count: verified,
                    percentage: getShareOfTotal(verified, total)
                },
                rejected: {
                    count: rejected,
                    percentage: getShareOfTotal(rejected, total)
                }
            }
        };
    }

    async fetchApprovalTableData(): Promise<IResponse<IApprovalTableDetails[]>> {
        const providers = await this._providerRepository.find({ isDeleted: false });
        if (!providers || !providers.length) {
            return {
                success: true,
                message: 'list is empty'
            }
        }

        const tableData: IApprovalTableDetails[] = providers.map(provider => ({
            id: provider.id,
            avatar: provider.avatar,
            date: provider.createdAt as Date,
            documentCount: provider.docs.length,
            email: provider.email,
            name: provider.fullname ?? provider.username,
            verificationStatus: provider.verificationStatus
        }))

        return {
            success: true,
            message: 'table data fetched',
            data: tableData
        }
    }

}