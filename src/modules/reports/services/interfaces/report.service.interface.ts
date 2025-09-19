import { IReport, IReportDetail, IReportFilter, IReportOverViewMatrix, IReportWithPagination, ReportedType } from "@core/entities/interfaces/report.entity.interface";
import { ReportStatus } from "@core/enum/report.enum";
import { IResponse } from "@core/misc/response.util";
import { ReportSubmitDto } from "@modules/reports/dto/report.dto";

export interface IReportService {
    submitReport(reportedId: string, type: ReportedType, report: ReportSubmitDto): Promise<IResponse>;
    fetchReports(page: number, filter: IReportFilter): Promise<IResponse<IReportWithPagination>>;
    updateReportStatus(reportId: string, status: ReportStatus): Promise<IResponse>;
    fetchOneReport(reportId: string): Promise<IResponse<IReportDetail>>;
    getReportOverviewData(): Promise<IResponse<IReportOverViewMatrix>>;
}