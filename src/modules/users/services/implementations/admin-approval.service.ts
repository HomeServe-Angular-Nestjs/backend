import { PROVIDER_REPOSITORY_INTERFACE_NAME } from '@/core/constants/repository.constant';
import { IApprovalOverviewData, IApprovalTableDetails, IProvider, VerificationStatusType } from '@/core/entities/interfaces/user.entity.interface';
import { ErrorCodes } from '@/core/enum/error.enum';
import { IResponse } from '@/core/misc/response.util';
import { IProviderRepository } from '@/core/repositories/interfaces/provider-repo.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { IAdminApprovalService } from '../interfaces/admin-approval-service.interface';
import { PROVIDER_MAPPER } from '@core/constants/mappers.constant';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';
import { UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { IUploadsUtility } from '@core/utilities/interface/upload.utility.interface';
import { BadRequestException } from '@nestjs/common';
import { ErrorMessage } from '@core/enum/error.enum';

@Injectable()
export class AdminApprovalService implements IAdminApprovalService {

    constructor(
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(PROVIDER_MAPPER)
        private readonly _providerMapper: IProviderMapper,
        @Inject(UPLOAD_UTILITY_NAME)
        private readonly _uploadUtility: IUploadsUtility
    ) { }

    async fetchApprovalOverviewDetails(): Promise<IResponse<IApprovalOverviewData>> {
        const providerDocuments = await this._providerRepository.find({ isDeleted: false });
        const providers = (providerDocuments ?? []).map(provider => this._providerMapper.toEntity(provider))
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
            avatar: provider.avatar ? this._uploadUtility.getSignedImageUrl(provider.avatar) : '',
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

    async updateProviderVerification(providerId: string, status: VerificationStatusType): Promise<IResponse<boolean>> {
        if (status !== 'pending' && !(await this._providerRepository.hasSubmittedDocuments(providerId))) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.NO_DOCUMENTS_TO_VERIFY,
            });
        }

        const updated = await this._providerRepository.updateVerificationStatus(providerId, status);

        if (!updated) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: `Provider with ID ${providerId} not found.`,
            });
        }

        return {
            success: true,
            message: `Provider verification status updated to ${status}.`,
            data: true,
        };
    }

}
