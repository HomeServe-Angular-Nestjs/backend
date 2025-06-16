import { Provider } from "@nestjs/common";
import { SCHEDULES_SERVICE_NAME } from "src/core/constants/service.constant";
import { SchedulesService } from "../services/implemetations/provider-schedules.service";

export const schedulesServiceProviders: Provider[] = [
    {
        provide: SCHEDULES_SERVICE_NAME,
        useClass: SchedulesService
    }
]