import { Controller, Get, Inject, InternalServerErrorException, Logger, Query, Req, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { PROVIDER_BOOKING_SERVICE_NAME } from '../../../core/constants/service.constant';
import { AuthInterceptor } from '../../auth/interceptors/auth.interceptor';
import { IPayload } from '../../../core/misc/payload.interface';
import { Request } from 'express';
import { IProviderBookingService } from '../services/interfaces/provider-booking-service.interface';
import { IResponseProviderBookingLists } from '../../../core/entities/interfaces/booking.entity.interface';
import { BookingPaginationFilterDto } from '../dtos/booking.dto';
import { filter } from 'rxjs';


@Controller('provider/bookings')
@UseInterceptors(AuthInterceptor)
export class ProviderBookingsController {
    private readonly logger = new Logger(ProviderBookingsController.name);

    constructor(
        @Inject(PROVIDER_BOOKING_SERVICE_NAME)
        private readonly _providerBookingService: IProviderBookingService
    ) { }

    @Get('')
    async fetchBookings(@Req() req: Request, @Query() paginationDto: BookingPaginationFilterDto): Promise<IResponseProviderBookingLists> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException('User not found');
            }

            const { page, ...filters } = paginationDto;

            return this._providerBookingService.fetchBookingsList(user.sub, page, filters);
        } catch (err) {
            this.logger.error(`Error fetching bookings for the provider: ${err}`);
            throw new InternalServerErrorException('Something happened while fetching bookings for the provider');
        }
    }

    @Get('overview_data')
    async getOverviewData(@Req() req: Request) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException('User not found');
            }

            return this._providerBookingService.fetchOverviewData(user.sub);
        } catch (err) {
            this.logger.error(`Error fetching overview data for the provider: ${err}`);
            throw new InternalServerErrorException('Something happened while fetching overview data for the provider');
        }
    }
}