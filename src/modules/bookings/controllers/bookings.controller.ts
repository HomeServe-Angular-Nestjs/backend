import { Request } from 'express';

import {
    BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, Patch, Post,
    Query, Req, UnauthorizedException
} from '@nestjs/common';

import { CUSTOMER_SERVICE_NAME } from '../../../core/constants/service.constant';
import {
    IBookingDetailCustomer, IBookingResponse, IBookingWithPagination
} from '../../../core/entities/interfaces/booking.entity.interface';
import { ErrorMessage } from '../../../core/enum/error.enum';
import { ICustomLogger } from '../../../core/logger/interface/custom-logger.interface';
import {
    ILoggerFactory, LOGGER_FACTORY
} from '../../../core/logger/interface/logger-factory.interface';
import { IPayload } from '../../../core/misc/payload.interface';
import { IResponse } from '../../../core/misc/response.util';
import {
    BookingDto, BookingIdDto, BookingPaginationFilterDto, CancelBookingDto, SelectedServiceDto,
    UpdateBookingDto
} from '../dtos/booking.dto';
import { IBookingService } from '../services/interfaces/booking-service.interface';

@Controller('booking')
export class BookingsController {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(CUSTOMER_SERVICE_NAME)
        private readonly _bookingService: IBookingService,
    ) {
        this.logger = this.loggerFactory.createLogger(BookingsController.name);
    }

    @Post('price_breakup')
    async calcPriceBreakup(@Body() dto: SelectedServiceDto[]) {
        try {
            if (!dto || dto.length === 0) {
                throw new BadRequestException(ErrorMessage.MISSING_FIELDS);
            }

            return await this._bookingService.preparePriceBreakup(dto);
        } catch (err) {
            this.logger.error(`Error while price calculation: ${err}`);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('confirm')
    async handleBooking(@Req() req: Request, @Body() dto: BookingDto): Promise<IResponse> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            if (!Array.isArray(dto.serviceIds) || dto.serviceIds.some(s => !s.id || !Array.isArray(s.selectedIds))) {
                throw new BadRequestException('Invalid serviceIds format');
            }

            return this._bookingService.createBooking(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error creating bookings: ${err}`);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('fetch')
    async fetchBooking(@Req() req: Request, @Query() dto: BookingPaginationFilterDto): Promise<IBookingWithPagination> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            const { page, ...filter } = dto;

            return await this._bookingService.fetchBookings(user.sub, page);
        } catch (err) {
            this.logger.error(`Error fetching bookings: ${err}`);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('view_details')
    async getBookingDetails(@Query() dto: BookingIdDto): Promise<IBookingDetailCustomer> {
        try {
            const { bookingId } = dto
            if (!bookingId) {
                throw new BadRequestException(ErrorMessage.MISSING_FIELDS);
            }

            return await this._bookingService.fetchBookingDetails(bookingId);
        } catch (err) {
            this.logger.error(`Error fetching booking details: ${err}`);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('cancel')
    async cancelBooking(@Body() dto: CancelBookingDto): Promise<IResponse> {
        try {
            return await this._bookingService.cancelBooking(dto);
        } catch (err) {
            this.logger.error(`Error cancelling a booking: ${err}`);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('update')
    async updateBooking(@Body() dto: UpdateBookingDto): Promise<IResponse<IBookingResponse>> {
        try {
            return await this._bookingService.updateBooking(dto);
        } catch (err) {
            this.logger.error(`Error cancelling a booking: ${err}`);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }
}
