import { ReportController } from "@modules/reports/controllers/report.controller";
import { reportRepositoryProvider } from "@modules/reports/providers/repository.providers";
import { reportServiceProviders } from "@modules/reports/providers/service.providers";
import { Module } from "@nestjs/common";
import { SharedModule } from "@shared/shared.module";

@Module({
    imports: [SharedModule],
    controllers: [ReportController],
    providers: [
        ...reportServiceProviders,
        ...reportRepositoryProvider
    ]
})
export class ReportModule { }