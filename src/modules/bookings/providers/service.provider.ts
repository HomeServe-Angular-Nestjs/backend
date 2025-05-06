import { Provider } from "@nestjs/common";
import { BOOKING_SERVICE_NAME, TOKEN_SERVICE_NAME } from "../../../core/constants/service.constant";
import { BookingService } from "../services/implementations/booking.service";
import { TokenService } from "../../auth/services/implementations/token.service";

export const serviceProviders: Provider[] = [
    {
        provide: BOOKING_SERVICE_NAME,
        useClass: BookingService
    },
    {
        provide: TOKEN_SERVICE_NAME,
        useClass: TokenService,
    },
];