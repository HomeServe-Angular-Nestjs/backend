import { CloudinaryModule } from "@configs/cloudinary/cloudinary.module";
import { ReportController } from "@modules/reports/controllers/report.controller";
import { reportRepositoryProvider } from "@modules/reports/providers/repository.providers";
import { reportServiceProviders } from "@modules/reports/providers/service.providers";
import { reportUtilityProviders } from "@modules/reports/providers/utility.providers";
import { Module } from "@nestjs/common";
import { SharedModule } from "@shared/shared.module";

@Module({
    imports: [CloudinaryModule.registerAsync(), SharedModule],
    controllers: [ReportController],
    providers: [
        ...reportServiceProviders,
        ...reportRepositoryProvider,
        ...reportUtilityProviders
    ]
})
export class ReportModule { }