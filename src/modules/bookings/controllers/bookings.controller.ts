import { BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, Logger, Post, Query, Req, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { BookingDto, BookingPaginationFilterDto, SelectedServiceDto } from '../dtos/booking.dto';
import { AuthInterceptor } from '../../auth/interceptors/auth.interceptor';
import { Request } from 'express';
import { IPayload } from '../../../core/misc/payload.interface';
import { CUSTOMER_SERVICE_NAME } from '../../../core/constants/service.constant';
import { IBookingService } from '../services/interfaces/booking-service.interface';
import { IBooking, IBookingResponse, IBookingWithPagination } from '../../../core/entities/interfaces/booking.entity.interface';

@Controller('booking')
@UseInterceptors(AuthInterceptor)
export class BookingsController {
    private readonly logger = new Logger(BookingsController.name);

    constructor(
        @Inject(CUSTOMER_SERVICE_NAME)
        private readonly _bookingService: IBookingService,
    ) { }

    @Post('price_breakup')
    async calcPriceBreakup(@Body() dto: SelectedServiceDto[]) {
        try {
            if (!dto || dto.length === 0) {
                throw new Error('No services selected for price calculation.');
            }

            return await this._bookingService.preparePriceBreakup(dto);
        } catch (err) {
            this.logger.error(`Error fetching provider: ${err}`);
            throw new InternalServerErrorException('Something happened while price calculation');
        }
    }

    @Post('confirm')
    async handleBooking(@Req() req: Request, @Body() dto: BookingDto): Promise<boolean> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException('User not found');
            }

            if (!Array.isArray(dto.serviceIds) || dto.serviceIds.some(s => !s.id || !Array.isArray(s.selectedIds))) {
                throw new BadRequestException('Invalid serviceIds format');
            }

            return this._bookingService.createBooking(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error creating bookings: ${err}`);
            throw new InternalServerErrorException('Something happened while creating booking');
        }
    }

    @Get('fetch')
    async fetchBooking(@Req() req: Request, @Query() dto: BookingPaginationFilterDto): Promise<IBookingWithPagination> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException('User not found');
            }

            const { page, ...filter } = dto;

            return this._bookingService.fetchBookings(user.sub, page);
        } catch (err) {
            this.logger.error(`Error fetching bookings: ${err}`);
            throw new InternalServerErrorException('Something happened while fetching booking');
        }
    }
}
