import { Controller, Get, Inject, InternalServerErrorException, Logger, Query } from "@nestjs/common";
import { ADMIN_BOOKINGS_SERVICE_NAME } from "src/core/constants/service.constant";
import { IAdminBookingService } from "../services/interfaces/admin-bookings-service.interface";
import { ErrorMessage } from "src/core/enum/error.enum";
import { IResponse } from "src/core/misc/response.util";
import { IAdminBookingForTable, IBookingStats, IPaginatedBookingsResponse } from "src/core/entities/interfaces/booking.entity.interface";
import { FilterWithPaginationDto, GetBookingsFilter } from "../dtos/admin-user.dto";
import { CustomLogger } from "src/core/logger/custom-logger";

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
