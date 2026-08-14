import type {
  IReportDetail,
  IReportFilter,
  IReportOverViewMatrix,
  IReportWithPagination,
  ReportedType,
} from '@core/entities/interfaces/report.entity.interface';
import { IReport } from '@core/entities/interfaces/report.entity.interface';
import type { ReportStatus } from '@core/enum/report.enum';
import type { IResponse } from '@core/misc/response.util';
import type { ReportSubmitDto } from '@modules/reports/dto/report.dto';

export interface IReportService {
  submitReport(reportedId: string, type: ReportedType, report: ReportSubmitDto): Promise<IResponse>;
  fetchReports(page: number, filter: IReportFilter): Promise<IResponse<IReportWithPagination>>;
  updateReportStatus(reportId: string, status: ReportStatus, resolutionNote?: string): Promise<IResponse>;
  updateInvestigationNotes(reportId: string, investigationNotes: string): Promise<IResponse>;
  fetchOneReport(reportId: string): Promise<IResponse<IReportDetail>>;
  getReportOverviewData(): Promise<IResponse<IReportOverViewMatrix>>;
}
