import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { REPORT_MODEL_NAME } from "@core/constants/model.constant";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { IReportRepository } from "@core/repositories/interfaces/report-repo.interface";
import { ReportDocument } from "@core/schema/report.schema";

@Injectable()
export class ReportRepository extends BaseRepository<ReportDocument> implements IReportRepository {
    constructor(
        @InjectModel(REPORT_MODEL_NAME)
        private readonly _reportModel: Model<ReportDocument>
    ) {
        super(_reportModel);
    }
}