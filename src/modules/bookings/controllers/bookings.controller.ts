import { Body, Controller, Get, Inject, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CUSTOMER_SERVICE_NAME } from '../../../core/constants/service.constant';
import { IBookingDetailCustomer, IBookingResponse, IBookingWithPagination } from '../../../core/entities/interfaces/booking.entity.interface';
import { ICustomLogger } from '../../../core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '../../../core/logger/interface/logger-factory.interface';
import { IPayload } from '../../../core/misc/payload.interface';
import { IResponse } from '../../../core/misc/response.util';
import { AddReviewDto, BookingIdDto, BookingPaginationFilterDto, CancelBookingDto, SaveBookingDto, UpdateBookingDto, UpdateBookingPaymentStatusDto } from '../dtos/booking.dto';
import { IBookingService } from '../services/interfaces/booking-service.interface';
import { User } from '@core/decorators/extract-user.decorator';
import { OngoingPaymentGuard } from '@core/guards/ongoing-payment.guard';
import { ProviderIdDto } from '@modules/customer/dtos/customer.dto';

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

    @Get('price_breakup')
    async fetchPriceBreakup(@User() user: IPayload) {
        return await this._bookingService.fetchPriceBreakup(user.sub);
    }

    @UseGuards(OngoingPaymentGuard)
    @Post('confirm')
    async handleBooking(@User() user: IPayload, @Body() bookingDto: SaveBookingDto) {
        return this._bookingService.createBooking(user.sub, bookingDto);
    }

    @Get('fetch')
    async fetchBooking(@User() user: IPayload, @Query() bookingDto: BookingPaginationFilterDto): Promise<IBookingWithPagination> {
        const { page } = bookingDto;
        return await this._bookingService.fetchBookings(user.sub, page);
    }

    @Get('view_details')
    async getBookingDetails(@Query() { bookingId }: BookingIdDto): Promise<IBookingDetailCustomer> {
        return await this._bookingService.fetchBookingDetails(bookingId);
    }

    @Patch('cancel')
    async cancelBooking(@User() user: IPayload, @Body() bookingDto: CancelBookingDto): Promise<IResponse<IBookingResponse>> {
        return await this._bookingService.markBookingCancelledByCustomer(user.sub, bookingDto.bookingId, bookingDto.reason);
    }

    @Patch('update')
    async updateBooking(@Body() bookingDto: UpdateBookingDto): Promise<IResponse<IBookingResponse>> {
        return await this._bookingService.updateBooking(bookingDto);
    }

    @Patch('add_review')
    async addReview(@Body() body: AddReviewDto): Promise<IResponse> {
        return this._bookingService.addReview(body);
    }

    @Post('call')
    async canStartVideoCall(@User() user: IPayload, @Body() { providerId }: ProviderIdDto): Promise<IResponse> {
        return this._bookingService.canStartVideoCall(user.sub, providerId);
    }
}
