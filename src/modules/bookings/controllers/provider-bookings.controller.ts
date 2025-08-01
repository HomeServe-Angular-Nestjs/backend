import { Request } from 'express';

import {
    BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, Patch, Query,
    Req, UnauthorizedException
} from '@nestjs/common';

import { PROVIDER_BOOKING_SERVICE_NAME } from '../../../core/constants/service.constant';
import {
    IResponseProviderBookingLists
} from '../../../core/entities/interfaces/booking.entity.interface';
import {
    CUSTOM_LOGGER, ICustomLogger
} from '../../../core/logger/interface/custom-logger.interface';
import { IPayload } from '../../../core/misc/payload.interface';
import {
    BookingIdDto, BookingPaginationFilterDto, UpdateBookingStatusDto
} from '../dtos/booking.dto';
import { IProviderBookingService } from '../services/interfaces/provider-booking-service.interface';

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

    @Get('fetch_details')
    async getBookingDetails(@Query() dto: BookingIdDto) {
        try {
            const { bookingId } = dto
            if (!bookingId) {
                throw new BadRequestException('Booking Id not found');
            }

            return await this._providerBookingService.fetchBookingDetails(bookingId);
        } catch (err) {
            this.logger.error(`Error fetching booking details for the provider: ${err}`);
            throw new InternalServerErrorException('Something happened while fetching booking details for the provider');
        }
    }

    @Patch('b_status')
    async updateBookingStatus(@Body() dto: UpdateBookingStatusDto) {
        try {
            if (!dto.bookingId || !dto.newStatus) {
                throw new BadRequestException('Booking Id or new status not found');
            }

            return this._providerBookingService.updateBookingStatus(dto);
        } catch (err) {
            this.logger.error(`Error updating the booking status: ${err}`);
            throw new InternalServerErrorException('Something happened while updating the booking status');
        }
    }
}
