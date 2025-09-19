import { IReport } from "@core/entities/interfaces/report.entity.interface";
import { ReportDocument } from "@core/schema/report.schema";

export interface IReportMapper {
    toDocument(entity: Partial<IReport>): Partial<ReportDocument>;
    toEntity(doc: Partial<ReportDocument>): IReport;
}