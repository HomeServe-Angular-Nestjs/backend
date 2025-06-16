import { Module } from "@nestjs/common";
import { schedulesServiceProviders } from "./providers/service.provider";
import { schedulesRepositoryProviders } from "./providers/repository.provider";
import { SchedulesController } from "./controllers/schedule.controller";

@Module({
    imports: [],
    controllers: [SchedulesController],
    providers: [
        ...schedulesServiceProviders,
        ...schedulesRepositoryProviders
    ]
})
export class SchedulesModule { }