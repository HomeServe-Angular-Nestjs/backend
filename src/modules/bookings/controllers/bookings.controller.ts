import { Request } from 'express';
import { BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, Patch, Post, Query, Req } from '@nestjs/common';
import { CUSTOMER_SERVICE_NAME } from '../../../core/constants/service.constant';
import { IBookingDetailCustomer, IBookingResponse, IBookingWithPagination } from '../../../core/entities/interfaces/booking.entity.interface';
import { ErrorMessage } from '../../../core/enum/error.enum';
import { ICustomLogger } from '../../../core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '../../../core/logger/interface/logger-factory.interface';
import { IPayload } from '../../../core/misc/payload.interface';
import { IResponse } from '../../../core/misc/response.util';
import { AddReviewDto, BookingDto, BookingIdDto, BookingPaginationFilterDto, CancelBookingDto, SelectedServiceDto, UpdateBookingDto, UpdateBookingPaymentStatusDto } from '../dtos/booking.dto';
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
    async calcPriceBreakup(@Body() selectedServiceDto: SelectedServiceDto[]) {
        try {
            if (!selectedServiceDto || selectedServiceDto.length === 0) {
                throw new BadRequestException(ErrorMessage.MISSING_FIELDS);
            }

            return await this._bookingService.preparePriceBreakup(selectedServiceDto);
        } catch (err) {
            this.logger.error(`Error while price calculation: ${err}`);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('confirm')
    async handleBooking(@Req() req: Request, @Body() bookingDto: BookingDto) {
        const user = req.user as IPayload;

        if (!Array.isArray(bookingDto.serviceIds) || bookingDto.serviceIds.some(s => !s.id || !Array.isArray(s.selectedIds))) {
            throw new BadRequestException('Invalid serviceIds format');
        }

        return this._bookingService.createBooking(user.sub, bookingDto);
    }

    @Get('fetch')
    async fetchBooking(@Req() req: Request, @Query() bookingDto: BookingPaginationFilterDto): Promise<IBookingWithPagination> {
        const user = req.user as IPayload;
        const { page } = bookingDto;
        return await this._bookingService.fetchBookings(user.sub, page);
    }

    @Get('view_details')
    async getBookingDetails(@Query() bookingDto: BookingIdDto): Promise<IBookingDetailCustomer> {
        try {
            const { bookingId } = bookingDto
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
    async cancelBooking(@Body() bookingDto: CancelBookingDto): Promise<IResponse> {
        return await this._bookingService.markBookingCancelledByCustomer(bookingDto.bookingId, bookingDto.reason);
    }

    @Patch('update')
    async updateBooking(@Body() bookingDto: UpdateBookingDto): Promise<IResponse<IBookingResponse>> {
        try {
            return await this._bookingService.updateBooking(bookingDto);
        } catch (err) {
            this.logger.error(`Error cancelling a booking: ${err}`);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('payment_status')
    async updatePaymentStatus(@Body() bookingDto: UpdateBookingPaymentStatusDto): Promise<IResponse<boolean>> {
        try {
            return await this._bookingService.updateBookingPaymentStatus(bookingDto);
        } catch (err) {
            this.logger.error(`Error cancelling a booking: ${err}`);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('add_review')
    async addReview(@Body() body: AddReviewDto): Promise<IResponse> {
        return this._bookingService.addReview(body);
    }
}
