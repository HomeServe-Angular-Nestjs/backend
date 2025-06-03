import { Provider } from "@nestjs/common";
import { CUSTOMER_SERVICE_NAME, PROVIDER_BOOKING_SERVICE_NAME, TOKEN_SERVICE_NAME } from "../../../core/constants/service.constant";
import { BookingService } from "../services/implementations/booking.service";
import { TokenService } from "../../auth/services/implementations/token.service";
import { ProviderBookingService } from "../services/implementations/provider-bookings.service";

export const serviceProviders: Provider[] = [
    {
        provide: CUSTOMER_SERVICE_NAME,
        useClass: BookingService
    },
    {
        provide: TOKEN_SERVICE_NAME,
        useClass: TokenService,
    },
    {
        provide: PROVIDER_BOOKING_SERVICE_NAME,
        useClass: ProviderBookingService
    }
];