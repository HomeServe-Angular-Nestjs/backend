import { REPORT_SERVICE_NAME } from "@core/constants/service.constant";
import { ReportService } from "@modules/reports/services/implementation/report.service";
import { Provider } from "@nestjs/common";

export const reportServiceProviders: Provider[] = [
    {
        provide: REPORT_SERVICE_NAME,
        useClass: ReportService
    }
]