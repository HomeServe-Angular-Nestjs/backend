import { Provider } from "@nestjs/common";
import { AVAILABILITY_SERVICE_NAME } from "@core/constants/service.constant";
import { AvailabilityService } from "@modules/availability/services/implementation/availability.service";

export const availabilityServiceProviders: Provider[] = [
    {
        provide: AVAILABILITY_SERVICE_NAME,
        useClass: AvailabilityService
    }
]