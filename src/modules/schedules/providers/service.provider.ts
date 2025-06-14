import { Provider } from "@nestjs/common";
import { SchedulesService } from "../services/implemetations/schedules.service";
import { SCHEDULES_SERVICE_NAME } from "src/core/constants/service.constant";

export const schedulesServiceProviders: Provider[] = [
    {
        provide: SCHEDULES_SERVICE_NAME,
        useClass: SchedulesService
    }
]