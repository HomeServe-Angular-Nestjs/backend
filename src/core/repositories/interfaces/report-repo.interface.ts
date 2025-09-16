import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { ReportDocument } from "@core/schema/report.schema";

export interface IReportRepository extends IBaseRepository<ReportDocument> { }