import { Request, Response } from 'express';

import { BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, Patch, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';

import { PROVIDER_BOOKING_SERVICE_NAME } from '../../../core/constants/service.constant';
import { IResponseProviderBookingLists } from '../../../core/entities/interfaces/booking.entity.interface';
import { CUSTOM_LOGGER, ICustomLogger } from '../../../core/logger/interface/custom-logger.interface';
import { IPayload } from '../../../core/misc/payload.interface';
import { BookingIdDto, BookingPaginationFilterDto, UpdateBookingStatusDto } from '../dtos/booking.dto';
import { IProviderBookingService } from '../services/interfaces/provider-booking-service.interface';
import { IResponse } from '@core/misc/response.util';

@Controller('provider/bookings')
export class ProviderBookingsController {
    constructor(
        @Inject(CUSTOM_LOGGER)
        private readonly logger: ICustomLogger,
        @Inject(PROVIDER_BOOKING_SERVICE_NAME)
        private readonly _providerBookingService: IProviderBookingService
    ) { }

    @Get('')
    async fetchBookings(@Req() req: Request, @Query() paginationDto: BookingPaginationFilterDto): Promise<IResponseProviderBookingLists> {
        const user = req.user as IPayload;
        const { page, ...filters } = paginationDto;

        return this._providerBookingService.fetchBookingsList(user.sub, page, filters);
    }

    @Get('overview_data')
    async getOverviewData(@Req() req: Request) {
        const user = req.user as IPayload;
        return this._providerBookingService.fetchOverviewData(user.sub);
    }

    @Get('fetch_details')
    async getBookingDetails(@Query() dto: BookingIdDto) {
        return await this._providerBookingService.fetchBookingDetails(dto.bookingId);
    }

    @Patch('b_status')
    async updateBookingStatus(@Body() dto: UpdateBookingStatusDto) {
        if (!dto.bookingId || !dto.newStatus) {
            throw new BadRequestException('Booking Id or new status not found');
        }

        return this._providerBookingService.updateBookingStatus(dto);
    }

    @Get('booked_slots')
    async fetchBookedSlots(@Req() req: Request): Promise<IResponse> {
        const user = req.user as IPayload;
        return this._providerBookingService.fetchBookedSlots(user.sub);
    }

    @Post('download_invoice')
    async downloadInvoice(@Body() { bookingId }: BookingIdDto, @Req() req: Request, @Res() res: Response) {
        const user = req.user as IPayload;
        const pdfBuffer = await this._providerBookingService.downloadBookingInvoice(bookingId, user.type);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="booking-invoice.pdf"',
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);
    }
}
