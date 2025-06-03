import { BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, Logger, Post, Req, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { PROVIDER_BOOKING_SERVICE_NAME } from '../../../core/constants/service.constant';
import { AuthInterceptor } from '../../auth/interceptors/auth.interceptor';
import { IPayload } from '../../../core/misc/payload.interface';
import { Request } from 'express';
import { IProviderBookingService } from '../services/interfaces/provider-booking-service.interface';
import { IProviderBookingLists } from '../../../core/entities/interfaces/booking.entity.interface';


@Controller('provider')
@UseInterceptors(AuthInterceptor)
export class ProviderBookingsController {
    private readonly logger = new Logger(ProviderBookingsController.name);

    constructor(
        @Inject(PROVIDER_BOOKING_SERVICE_NAME)
        private readonly _providerBookingService: IProviderBookingService
    ) { }

    @Get('bookings')
    async fetchBookings(@Req() req: Request): Promise<IProviderBookingLists[]> {
        const user = req.user as IPayload;
        if (!user.sub) {
            throw new UnauthorizedException('User not found');
        }

        return this._providerBookingService.fetchBookingsList();
    }
}