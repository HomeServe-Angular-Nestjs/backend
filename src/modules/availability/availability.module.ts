import { AvailabilityController } from "@modules/availability/controller/availability.controller";
import { Module } from "@nestjs/common";

@Module({
    imports: [],
    controllers: [AvailabilityController],
    providers: [],
    exports: [],
})
export class AvailabilityModule { }