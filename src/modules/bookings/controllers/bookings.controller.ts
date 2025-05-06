import { Body, Controller, Inject, InternalServerErrorException, Logger, Post, Req, UseInterceptors } from '@nestjs/common';
import { SelectedServiceDto } from '../dtos/booking.dto';
import { AuthInterceptor } from '../../auth/interceptors/auth.interceptor';
import { Request } from 'express';
import { IPayload } from '../../../core/misc/payload.interface';
import { BOOKING_SERVICE_NAME } from '../../../core/constants/service.constant';
import { IBookingService } from '../services/interfaces/booking-service.interface';

@Controller('booking')
@UseInterceptors(AuthInterceptor)
export class BookingsController {
    private readonly logger = new Logger(BookingsController.name);

    constructor(
        @Inject(BOOKING_SERVICE_NAME)
        private readonly _bookingService: IBookingService
    ) { }

    @Post('price_breakup')
    async preparePriceBreakup(@Body() dto: SelectedServiceDto[]) {
        try {
            return await this._bookingService.preparePriceBreakup(dto);
        } catch (err) {
            this.logger.error(`Error fetching provider: ${err}`);
            throw new InternalServerErrorException('Something happened while price calculation');
        }
    }
}
