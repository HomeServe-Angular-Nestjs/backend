import { Controller, Get, Inject, InternalServerErrorException, Logger } from "@nestjs/common";
import { ADMIN_BOOKINGS_SERVICE_NAME } from "src/core/constants/service.constant";
import { IAdminBookingService } from "../services/interfaces/admin-bookings-service.interface";
import { ErrorMessage } from "src/core/enum/error.enum";
import { IResponse } from "src/core/misc/response.util";
import { IAdminBookingForTable } from "src/core/entities/interfaces/booking.entity.interface";

@Controller('admin/bookings')
export class AdminBookingController {
    private readonly logger = new Logger(AdminBookingController.name);

    constructor(
        @Inject(ADMIN_BOOKINGS_SERVICE_NAME)
        private readonly _adminBookingService: IAdminBookingService
    ) { }

    @Get('')
    async getBookings(): Promise<IResponse<IAdminBookingForTable[]>> {
        try {
            return await this._adminBookingService.fetchBookings(1);
        } catch (err) {
            this.logger.error(`Error fetching bookings table details: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

}