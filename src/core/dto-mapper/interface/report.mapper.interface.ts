import type { IReport } from '@core/entities/interfaces/report.entity.interface';
import type { ReportDocument } from '@core/schema/report.schema';

export interface IReportMapper {
  toDocument(entity: Partial<IReport>): Partial<ReportDocument>;
  toEntity(doc: Partial<ReportDocument>): IReport;
}
