import { AvailabilityController } from "@modules/availability/controller/availability.controller";
import { availabilityRepositoryProviders } from "@modules/availability/provider/availability-repository.provider";
import { availabilityServiceProviders } from "@modules/availability/provider/availability-service.provider";
import { availabilityUtilityProvider } from "@modules/availability/provider/availability.util";
import { Module } from "@nestjs/common";
import { SharedModule } from "@shared/shared.module";

@Module({
    imports: [SharedModule],
    controllers: [AvailabilityController],
    providers: [
        ...availabilityServiceProviders,
        ...availabilityRepositoryProviders,
        ...availabilityUtilityProvider
    ],
    exports: [],
})
export class AvailabilityModule { }