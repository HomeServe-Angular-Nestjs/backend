import { Controller, Get, Inject, Logger, Query, Req, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { PROVIDER_BOOKING_SERVICE_NAME } from '../../../core/constants/service.constant';
import { AuthInterceptor } from '../../auth/interceptors/auth.interceptor';
import { IPayload } from '../../../core/misc/payload.interface';
import { Request } from 'express';
import { IProviderBookingService } from '../services/interfaces/provider-booking-service.interface';
import { IResponseProviderBookingLists } from '../../../core/entities/interfaces/booking.entity.interface';
import { BookingPaginationFilterDto } from '../dtos/booking.dto';
import { filter } from 'rxjs';


@Controller('provider')
@UseInterceptors(AuthInterceptor)
export class ProviderBookingsController {
    private readonly logger = new Logger(ProviderBookingsController.name);

    constructor(
        @Inject(PROVIDER_BOOKING_SERVICE_NAME)
        private readonly _providerBookingService: IProviderBookingService
    ) { }

    @Get('bookings')
    async fetchBookings(@Req() req: Request, @Query() paginationDto: BookingPaginationFilterDto): Promise<IResponseProviderBookingLists> {
        const user = req.user as IPayload;
        if (!user.sub) {
            throw new UnauthorizedException('User not found');
        }

        const { page, ...filters } = paginationDto;

        return this._providerBookingService.fetchBookingsList(page, filters);
    }
}