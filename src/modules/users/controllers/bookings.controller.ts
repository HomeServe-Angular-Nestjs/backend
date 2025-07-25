import { ADMIN_BOOKINGS_SERVICE_NAME } from '@core/constants/service.constant';
import {
    IBookingStats, IPaginatedBookingsResponse
} from '@core/entities/interfaces/booking.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { IResponse } from '@core/misc/response.util';
import { GetBookingsFilter } from '@modules/users/dtos/admin-user.dto';
import {
    IAdminBookingService
} from '@modules/users/services/interfaces/admin-bookings-service.interface';
import { Controller, Get, Inject, InternalServerErrorException, Query } from '@nestjs/common';

@Controller('admin/bookings')
export class AdminBookingController {
    private readonly logger = new CustomLogger(AdminBookingController.name);

    constructor(
        @Inject(ADMIN_BOOKINGS_SERVICE_NAME)
        private readonly _adminBookingService: IAdminBookingService
    ) { }

    @Get('')
    async getBookings(@Query() dto: GetBookingsFilter): Promise<IResponse<IPaginatedBookingsResponse>> {
        try {
            return await this._adminBookingService.fetchBookings(dto);
        } catch (err) {
            this.logger.error(`Error fetching bookings table details: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('stats')
    async getBookingStats(): Promise<IResponse<IBookingStats>> {
        try {
            return await this._adminBookingService.getBookingStats();
        } catch (err) {
            this.logger.error(`Error fetching bookings stats: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

}
