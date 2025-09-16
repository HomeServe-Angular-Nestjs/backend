import { ReportedType } from "@core/entities/interfaces/report.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { ReportSubmitDto } from "@modules/reports/dto/report.dto";

export interface IReportService {
    submitReport(reportedId: string, type: ReportedType, report: ReportSubmitDto): Promise<IResponse>;
}