import type { IEntity } from '@core/entities/base/interfaces/base-entity.entity.interface';
import type { IPagination } from '@core/entities/interfaces/booking.entity.interface';
import type { ComplaintReason, ReportStatus } from '@core/enum/report.enum';

export type ReportedType = 'customer' | 'provider' | 'review';

export interface IReport extends IEntity {
  reportedId: string;
  targetId: string;
  type: ReportedType;
  reason: ComplaintReason;
  description: string;
  status: ReportStatus;
  investigationNotes?: string;
  resolutionNote?: string;
  resolvedAt?: Date | string;
}

export interface IReportFilter {
  page?: number;
  search?: string;
  status?: ReportStatus;
  type?: ReportedType;
}

export interface IReportTargetSummary {
  total: number;
  pending: number;
  resolved: number;
  rejected: number;
}

export interface IReportBookingInfo {
  bookingId: string;
  createdAt: Date | string;
  bookingStatus: string;
  totalAmount: number;
  hasReview: boolean;
}

export interface IReportReviewInfo {
  desc: string;
  rating: number;
  writtenAt: Date | string;
  isReported: boolean;
  isActive: boolean;
  serviceCount: number;
  bookingReference: string;
}

export interface IReportRelated {
  targetProfile?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'customer' | 'provider';
  };
  recentBookings?: IReportBookingInfo[];
  review?: IReportReviewInfo;
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
    role: 'customer' | 'provider';
  };
  target: {
    targetId: string;
    name: string;
    email: string;
    avatar: string;
    role: 'customer' | 'provider';
  };
  type: ReportedType;
  reason: string;
  status: ReportStatus;
  description: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  resolvedAt?: Date | string;
  investigationNotes?: string;
  resolutionNote?: string;
  related?: IReportRelated;
  previousReports?: IReportTargetSummary;
}

export interface IReportOverViewMatrix {
  total: number;
  pending: number;
  resolved: number;
  rejected: number;
  flagged: number;
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
