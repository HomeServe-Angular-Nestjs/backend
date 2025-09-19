import { IReportFilter, IReportOverViewMatrix } from "@core/entities/interfaces/report.entity.interface";
import { ReportStatus } from "@core/enum/report.enum";
import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { ReportDocument } from "@core/schema/report.schema";

export interface IReportRepository extends IBaseRepository<ReportDocument> {
    count(): Promise<number>;
    fetchReports(page: number, limit: number, filter: IReportFilter): Promise<ReportDocument[]>;
    updateReportStatus(reportId: string, status: ReportStatus): Promise<ReportDocument | null>;
    getReportOverviewDetails(): Promise<IReportOverViewMatrix>;
}