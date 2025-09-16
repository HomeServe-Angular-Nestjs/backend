import { REPORT_MODEL_NAME } from "@core/constants/model.constant";
import { REPORT_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ReportRepository } from "@core/repositories/implementations/report.repository";
import { ReportDocument } from "@core/schema/report.schema";
import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

export const reportRepositoryProvider: Provider[] = [
    {
        provide: REPORT_REPOSITORY_NAME,
        useFactory: (reportModel: Model<ReportDocument>) =>
            new ReportRepository(reportModel),
        inject: [getModelToken(REPORT_MODEL_NAME)]
    }
]