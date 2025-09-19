import { REPORT_MAPPER } from "@core/constants/mappers.constant";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, REPORT_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { UPLOAD_UTILITY_NAME } from "@core/constants/utility.constant";
import { IReportMapper } from "@core/dto-mapper/interface/report.mapper.interface";
import { IReportDetail, IReportFilter, IReportOverViewMatrix, IReportWithPagination, ReportedType } from "@core/entities/interfaces/report.entity.interface";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";
import { ReportStatus } from "@core/enum/report.enum";
import { IResponse } from "@core/misc/response.util";
import { ICustomerRepository } from "@core/repositories/interfaces/customer-repo.interface";
import { IProviderRepository } from "@core/repositories/interfaces/provider-repo.interface";
import { IReportRepository } from "@core/repositories/interfaces/report-repo.interface";
import { IUploadsUtility } from "@core/utilities/interface/upload.utility.interface";
import { ReportSubmitDto } from "@modules/reports/dto/report.dto";
import { IReportService } from "@modules/reports/services/interfaces/report.service.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class ReportService implements IReportService {

    constructor(
        @Inject(REPORT_REPOSITORY_NAME)
        private readonly _reportRepository: IReportRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(UPLOAD_UTILITY_NAME)
        private readonly _uploadsUtility: IUploadsUtility,
        @Inject(REPORT_MAPPER)
        private readonly _reportMapper: IReportMapper
    ) { }

    async submitReport(reportedId: string, type: ReportedType, report: ReportSubmitDto): Promise<IResponse> {
        const reported = await this._reportRepository.create(this._reportMapper.toDocument({
            ...report,
            reportedId,
            type,
            status: ReportStatus.PENDING,
        }));

        return {
            success: !!reported,
            message: !!reported ? 'Reported Success' : 'Failed to report'
        }
    }

    async fetchReports(page: number = 1, filter: IReportFilter): Promise<IResponse<IReportWithPagination>> {
        let limit = 10;
        const [reportDocs, total] = await Promise.all([
            this._reportRepository.fetchReports(page, limit, filter),
            this._reportRepository.count()
        ]);

        return {
            success: true,
            message: 'reports fetched.',
            data: {
                reports: reportDocs.map(r => this._reportMapper.toEntity(r)),
                pagination: {
                    limit,
                    page,
                    total
                }
            }
        }
    }

    async fetchOneReport(reportId: string): Promise<IResponse<IReportDetail>> {
        let reportDoc = await this._reportRepository.findById(reportId);

        if (!reportDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: ErrorMessage.DOCUMENT_NOT_FOUND
        });

        let report = this._reportMapper.toEntity(reportDoc);
        let customerId: string;
        let providerId: string;

        if (report.type === 'customer') {
            customerId = report.reportedId;
            providerId = report.targetId;
        } else if (report.type === 'provider') {
            providerId = report.reportedId;
            customerId = report.targetId;
        } else {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: ErrorMessage.MISSING_FIELDS
            });
        }

        const [customerDoc, providerDoc] = await Promise.all([
            this._customerRepository.findById(customerId),
            this._providerRepository.findById(providerId),
        ]);

        if (report.status === ReportStatus.PENDING) {
            const updatedReportDoc = await this._reportRepository.updateReportStatus(report.id, ReportStatus.IN_PROGRESS)
            report = updatedReportDoc ? this._reportMapper.toEntity(updatedReportDoc) : report;
        }

        if (!customerDoc || !providerDoc) throw new NotFoundException({
            code: ErrorCodes.DATABASE_OPERATION_FAILED,
            message: ErrorMessage.DOCUMENT_NOT_FOUND
        });

        const isCustomerReported = report.type === 'customer';

        const reportedId = isCustomerReported ? customerId : providerId;
        const reportedDoc = isCustomerReported ? customerDoc : providerDoc;

        const targetId = isCustomerReported ? providerId : customerId;
        const targetDoc = isCustomerReported ? providerDoc : customerDoc;

        const reportDetails: IReportDetail = {
            id: report.id,
            reportedBy: {
                reportedId,
                name: reportedDoc.username,
                email: reportedDoc.email,
                avatar: this._uploadsUtility.getSignedImageUrl(reportedDoc.avatar, 60 * 10)
            },
            target: {
                targetId,
                name: targetDoc.username,
                email: targetDoc.email,
                avatar: this._uploadsUtility.getSignedImageUrl(targetDoc.avatar, 60 * 10)
            },
            reason: report.reason,
            status: report.status,
            type: report.type,
            description: report.description,
            createdAt: report.createdAt as Date,
            updatedAt: report.updatedAt as Date,
        };

        return {
            success: true,
            message: 'Report details fetched successfully',
            data: reportDetails
        }
    }

    async updateReportStatus(reportId: string, status: ReportStatus): Promise<IResponse> {
        const reportDoc = await this._reportRepository.updateReportStatus(reportId, status);
        return {
            success: !!reportDoc,
            message: !!reportDoc ? 'status updated successfully' : 'Failed update status'
        }
    }

    async getReportOverviewData(): Promise<IResponse<IReportOverViewMatrix>> {
        const reportOverview = await this._reportRepository.getReportOverviewDetails();
        return {
            success: true,
            message: 'report overview data fetched successfully.',
            data: reportOverview
        }
    }
}