import { Body, Controller, Get, Inject, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { PROVIDER_BOOKING_SERVICE_NAME } from '../../../core/constants/service.constant';
import { IBookingDetailProvider, IResponseProviderBookingLists } from '../../../core/entities/interfaces/booking.entity.interface';
import { ICustomLogger } from '../../../core/logger/interface/custom-logger.interface';
import { IPayload } from '../../../core/misc/payload.interface';
import { BookingIdDto, BookingPaginationFilterDto, CancelReasonDto, ReviewFilterDto, SelectedSlotDto, UpdateBookingStatusDto, } from '../dtos/booking.dto';
import { IProviderBookingService } from '../services/interfaces/provider-booking-service.interface';
import { IResponse } from '@core/misc/response.util';
import { isValidIdPipe } from '@core/pipes/is-valid-id.pipe';
import { User } from '@core/decorators/extract-user.decorator';
import { OngoingPaymentGuard } from '@core/guards/ongoing-payment.guard';
import { CustomerIdDto } from '@modules/customer/dtos/customer.dto';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { Response } from 'express';
import { ClientUserType } from '@core/entities/interfaces/user.entity.interface';

@Controller('provider/bookings')
export class ProviderBookingsController {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(PROVIDER_BOOKING_SERVICE_NAME)
        private readonly _providerBookingService: IProviderBookingService
    ) {
        this.logger = this._loggerFactory.createLogger(ProviderBookingsController.name);
    }

    @Get('')
    async fetchBookings(@User() user: IPayload, @Query() paginationDto: BookingPaginationFilterDto): Promise<IResponseProviderBookingLists> {
        const { page, ...filters } = paginationDto;
        return await this._providerBookingService.fetchBookingsList(user.sub, page, filters);
    }

    @Get('overview_data')
    async getOverviewData(@User() user: IPayload) {
        return await this._providerBookingService.fetchOverviewData(user.sub);
    }

    @Get('fetch_details')
    async getBookingDetails(@Query() bookingDto: BookingIdDto) {
        return await this._providerBookingService.fetchBookingDetails(bookingDto.bookingId);
    }

    @Patch('cancel/:bookingId')
    async markBookingCancelledByProvider(@User() user: IPayload, @Param('bookingId', new isValidIdPipe()) bookingId: string, @Body() { reason }: CancelReasonDto): Promise<IResponse<IBookingDetailProvider>> {
        return await this._providerBookingService.markBookingCancelledByProvider(user.sub, bookingId, reason);
    }

    @Patch('status/:bookingId')
    async updateBookingStatus(@Param('bookingId', new isValidIdPipe()) bookingId: string, @Body() { newStatus }: UpdateBookingStatusDto): Promise<IResponse> {
        return await this._providerBookingService.updateBookingStatus(bookingId, newStatus);
    }

    @UseGuards(OngoingPaymentGuard)
    @Post('complete')
    async completeBooking(@User() user: IPayload, @Body() { bookingId }: BookingIdDto): Promise<IResponse<IBookingDetailProvider>> {
        return await this._providerBookingService.completeBooking(user.sub, bookingId);
    }

    @Post('download_invoice')
    async downloadInvoice(@Body() { bookingId }: BookingIdDto, @User() user: IPayload, @Res() res: Response) {
        const pdfBuffer = await this._providerBookingService.downloadBookingInvoice(bookingId, user.type as ClientUserType);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="booking-invoice.pdf"',
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);
    }

    @Get('review_data')
    async getReviewData(@User() user: IPayload, @Query() reviewDto: ReviewFilterDto): Promise<IResponse> {
        return await this._providerBookingService.getReviewData(user.sub, reviewDto);
    }

    @Post('call')
    async canStartVideoCall(@User() user: IPayload, @Body() { customerId }: CustomerIdDto): Promise<IResponse> {
        return this._providerBookingService.canStartVideoCall(user.sub, customerId);
    }

    @Patch('reschedule/:bookingId')
    async rescheduleBooking(@Param('bookingId', new isValidIdPipe()) bookingId: string, @Body() slotData: SelectedSlotDto): Promise<IResponse<IBookingDetailProvider>> {
        return await this._providerBookingService.rescheduleBooking(bookingId, slotData);
    }
}
