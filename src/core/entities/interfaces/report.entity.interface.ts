import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";
import { IPagination } from "@core/entities/interfaces/booking.entity.interface";
import { ComplaintReason, ReportStatus } from "@core/enum/report.enum";

export type ReportedType = 'customer' | 'provider';

export interface IReport extends IEntity {
    reportedId: string;
    targetId: string;
    type: ReportedType;
    reason: ComplaintReason;
    description: string;
    status: ReportStatus;
}

export interface IReportFilter {
    page?: number;
    search?: string;
    status?: ReportStatus;
    type?: ReportedType;
}

export interface IReportWithPagination {
    reports: IReport[];
    pagination: IPagination;
}

export interface IReportDetail {
    id: string;
    reportedBy: {
        reportedId: string;
        name: string;
        email: string;
        avatar: string;
    };
    target: {
        targetId: string;
        name: string;
        email: string;
        avatar: string;
    };
    type: ReportedType;
    reason: string;
    status: ReportStatus;
    description: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface IReportOverViewMatrix {
    total: number;
    pending: number;
    resolved: number;
    rejected: number;
    flagged: number;
    in_progress: number;
}

interface IDisputeAnalysisData {
    other: number;
    harassment: number;
    spam: number;
    inappropriate: number;
}

export interface IDisputeAnalyticsRaw extends IDisputeAnalysisData {
    month: number;
}

export interface IDisputeAnalytics extends IDisputeAnalysisData {
    month: string;
}