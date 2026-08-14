import type {
  IDisputeAnalyticsRaw,
  IReportFilter,
  IReportOverViewMatrix,
  IReportTargetSummary,
} from '@core/entities/interfaces/report.entity.interface';
import type { ReportStatus } from '@core/enum/report.enum';
import type { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import type { ReportDocument } from '@core/schema/report.schema';

export interface IReportRepository extends IBaseRepository<ReportDocument> {
  count(): Promise<number>;
  fetchReports(page: number, limit: number, filter: IReportFilter): Promise<ReportDocument[]>;
  updateReportStatus(reportId: string, status: ReportStatus, resolutionNote?: string): Promise<ReportDocument | null>;
  updateInvestigationNotes(reportId: string, investigationNotes: string): Promise<ReportDocument | null>;
  getTargetReportSummary(targetId: string): Promise<IReportTargetSummary>;
  getReportOverviewDetails(): Promise<IReportOverViewMatrix>;
  getMonthlyDisputeStats(providerId: string): Promise<IDisputeAnalyticsRaw[]>;
}
