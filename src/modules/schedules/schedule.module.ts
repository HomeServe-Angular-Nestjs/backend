import { Module } from "@nestjs/common";
import { SchedulesController } from "./controllers/schedule.controller";
import { SchedulesService } from "./services/implemetations/schedules.service";
import { schedulesServiceProviders } from "./providers/service.provider";
import { schedulesRepositoryProviders } from "./providers/repository.provider";

@Module({
    imports: [],
    controllers: [SchedulesController],
    providers: [
        ...schedulesServiceProviders,
        ...schedulesRepositoryProviders
    ]
})
export class SchedulesModule { }