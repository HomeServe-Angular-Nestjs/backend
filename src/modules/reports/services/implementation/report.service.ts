import { REPORT_MAPPER } from "@core/constants/mappers.constant";
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, REPORT_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { UPLOAD_UTILITY_NAME, PRICING_UTILITY_NAME } from "@core/constants/utility.constant";
import { IReportMapper } from "@core/dto-mapper/interface/report.mapper.interface";
import { IReport, IReportBookingInfo, IReportDetail, IReportFilter, IReportOverViewMatrix, IReportWithPagination, ReportedType } from "@core/entities/interfaces/report.entity.interface";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";
import { ReportStatus } from "@core/enum/report.enum";
import { IResponse } from "@core/misc/response.util";
import { IBookingRepository } from "@core/repositories/interfaces/bookings-repo.interface";
import { ICustomerRepository } from "@core/repositories/interfaces/customer-repo.interface";
import { IProviderRepository } from "@core/repositories/interfaces/provider-repo.interface";
import { IReportRepository } from "@core/repositories/interfaces/report-repo.interface";
import { BookingDocument } from "@core/schema/bookings.schema";
import { IUploadsUtility } from "@core/utilities/interface/upload.utility.interface";
import { IPricingUtility } from "@core/utilities/interface/pricing.utility.interface";
import { ReportSubmitDto } from "@modules/reports/dto/report.dto";
import { IReportService } from "@modules/reports/services/interfaces/report.service.interface";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class ReportService implements IReportService {

    constructor(
        @Inject(REPORT_REPOSITORY_NAME)
        private readonly _reportRepository: IReportRepository,
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(UPLOAD_UTILITY_NAME)
        private readonly _uploadsUtility: IUploadsUtility,
        @Inject(REPORT_MAPPER)
        private readonly _reportMapper: IReportMapper,
        @Inject(PRICING_UTILITY_NAME)
        private readonly _pricingUtility: IPricingUtility,
    ) { }

    async submitReport(reportedId: string, type: ReportedType, report: ReportSubmitDto): Promise<IResponse> {
        const reported = await this._reportRepository.create(this._reportMapper.toDocument({
            ...report,
            reportedId,
            type,
            status: ReportStatus.PENDING,
        }));

        if (type === 'review' && reported) {
            await this._bookingRepository.markReviewReported(report.targetId);
        }

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
        const reportDoc = await this._reportRepository.findById(reportId);

        if (!reportDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: ErrorMessage.DOCUMENT_NOT_FOUND
        });

        const report = this._reportMapper.toEntity(reportDoc);

        if (report.type === 'review') {
            return this._buildReviewReportDetail(report);
        }

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

        if (!customerDoc || !providerDoc) throw new NotFoundException({
            code: ErrorCodes.DATABASE_OPERATION_FAILED,
            message: ErrorMessage.DOCUMENT_NOT_FOUND
        });

        const isCustomerReported = report.type === 'customer';

        const reportedId = isCustomerReported ? customerId : providerId;
        const reportedDoc = isCustomerReported ? customerDoc : providerDoc;
        const reportedRole: 'customer' | 'provider' = isCustomerReported ? 'customer' : 'provider';

        const targetId = isCustomerReported ? providerId : customerId;
        const targetDoc = isCustomerReported ? providerDoc : customerDoc;
        const targetRole: 'customer' | 'provider' = isCustomerReported ? 'provider' : 'customer';

        const [previousReports, targetedBookings] = await Promise.all([
            this._reportRepository.getTargetReportSummary(targetId),
            isCustomerReported
                ? this._bookingRepository.findBookingsByProviderId(targetId)
                : this._bookingRepository.findBookingsByCustomerIdWithPagination(targetId, 0, 10),
        ]);

        return {
            success: true,
            message: 'Report details fetched successfully',
            data: {
                id: report.id,
                reportedBy: {
                    reportedId,
                    name: reportedDoc.username,
                    email: reportedDoc.email,
                    avatar: this._uploadsUtility.getSignedImageUrl(reportedDoc.avatar, 60 * 10),
                    role: reportedRole
                },
                target: {
                    targetId,
                    name: targetDoc.username,
                    email: targetDoc.email,
                    avatar: this._uploadsUtility.getSignedImageUrl(targetDoc.avatar, 60 * 10),
                    role: targetRole
                },
                reason: report.reason,
                status: report.status,
                type: report.type,
                description: report.description,
                createdAt: report.createdAt as Date,
                updatedAt: report.updatedAt as Date,
                resolvedAt: report.resolvedAt,
                investigationNotes: report.investigationNotes,
                resolutionNote: report.resolutionNote,
                previousReports,
                related: {
                    targetProfile: {
                        id: targetId,
                        name: targetDoc.username,
                        email: targetDoc.email,
                        avatar: this._uploadsUtility.getSignedImageUrl(targetDoc.avatar, 60 * 10),
                        role: targetRole
                    },
                    recentBookings: this._mapBookings(targetedBookings)
                }
            }
        }
    }

    private async _buildReviewReportDetail(report: IReport): Promise<IResponse<IReportDetail>> {
        const [reviewerCustomer, reviewerProvider] = await Promise.all([
            this._customerRepository.findById(report.reportedId),
            this._providerRepository.findById(report.reportedId),
        ]);

        const reviewerDoc = reviewerCustomer ?? reviewerProvider;
        if (!reviewerDoc) throw new NotFoundException({
            code: ErrorCodes.DATABASE_OPERATION_FAILED,
            message: ErrorMessage.DOCUMENT_NOT_FOUND
        });

        const booking = await this._bookingRepository.findById(report.targetId);
        if (!booking) throw new NotFoundException({
            code: ErrorCodes.DATABASE_OPERATION_FAILED,
            message: ErrorMessage.DOCUMENT_NOT_FOUND
        });

        const providerDoc = await this._providerRepository.findById(booking.providerId.toString());
        if (!providerDoc) throw new NotFoundException({
            code: ErrorCodes.DATABASE_OPERATION_FAILED,
            message: ErrorMessage.DOCUMENT_NOT_FOUND
        });

        const reviewerRole: 'customer' | 'provider' = reviewerCustomer ? 'customer' : 'provider';
        const providerId = booking.providerId.toString();
        const previousReports = await this._reportRepository.getTargetReportSummary(providerId);

        return {
            success: true,
            message: 'Report details fetched successfully',
            data: {
                id: report.id,
                reportedBy: {
                    reportedId: report.reportedId,
                    name: reviewerDoc.username,
                    email: reviewerDoc.email,
                    avatar: this._uploadsUtility.getSignedImageUrl(reviewerDoc.avatar, 60 * 10),
                    role: reviewerRole
                },
                target: {
                    targetId: report.targetId,
                    name: providerDoc.username,
                    email: providerDoc.email,
                    avatar: this._uploadsUtility.getSignedImageUrl(providerDoc.avatar, 60 * 10),
                    role: 'provider'
                },
                reason: report.reason,
                status: report.status,
                type: report.type,
                description: report.description,
                createdAt: report.createdAt as Date,
                updatedAt: report.updatedAt as Date,
                resolvedAt: report.resolvedAt,
                investigationNotes: report.investigationNotes,
                resolutionNote: report.resolutionNote,
                previousReports,
                related: {
                    targetProfile: {
                        id: providerId,
                        name: providerDoc.username,
                        email: providerDoc.email,
                        avatar: this._uploadsUtility.getSignedImageUrl(providerDoc.avatar, 60 * 10),
                        role: 'provider'
                    },
                    review: {
                        desc: booking.review?.desc ?? '',
                        rating: booking.review?.rating ?? 0,
                        writtenAt: booking.review?.writtenAt ?? booking.createdAt,
                        isReported: booking.review?.isReported ?? false,
                        isActive: booking.review?.isActive ?? true,
                        serviceCount: booking.services?.length ?? 0,
                        bookingReference: String(booking._id)
                    }
                }
            }
        }
    }

    private _mapBookings(bookings: BookingDocument[]): IReportBookingInfo[] {
        return bookings.slice(0, 5).map(b => ({
            bookingId: String(b._id),
            createdAt: b.createdAt,
            bookingStatus: b.bookingStatus,
            totalAmount: this._pricingUtility.paiseToRupees(b.totalAmount),
            hasReview: !!b.review
        }));
    }

    async updateReportStatus(reportId: string, status: ReportStatus, resolutionNote?: string): Promise<IResponse> {
        const isTerminal = status === ReportStatus.RESOLVED || status === ReportStatus.REJECTED;

        if (isTerminal && !resolutionNote?.trim()) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'A resolution note is required when resolving or rejecting a complaint'
            });
        }

        const reportDoc = await this._reportRepository.updateReportStatus(reportId, status, resolutionNote);
        return {
            success: !!reportDoc,
            message: !!reportDoc ? 'status updated successfully' : 'Failed update status'
        }
    }

    async updateInvestigationNotes(reportId: string, investigationNotes: string): Promise<IResponse> {
        const reportDoc = await this._reportRepository.updateInvestigationNotes(reportId, investigationNotes);
        return {
            success: !!reportDoc,
            message: !!reportDoc ? 'investigation notes updated successfully' : 'Failed to update notes'
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