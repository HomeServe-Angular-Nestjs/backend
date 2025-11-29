import { ADMIN_BOOKINGS_SERVICE_NAME } from '@core/constants/service.constant';
import { IBookingStats, IPaginatedBookingsResponse } from '@core/entities/interfaces/booking.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { IResponse } from '@core/misc/response.util';
import { BookingReportDownloadDto, GetBookingsFilter } from '@modules/users/dtos/admin-user.dto';
import { IAdminBookingService } from '@modules/users/services/interfaces/admin-bookings-service.interface';
import { Body, Controller, Get, Inject, InternalServerErrorException, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('admin/bookings')
export class AdminBookingController {
    private readonly logger = new CustomLogger(AdminBookingController.name);

    constructor(
        @Inject(ADMIN_BOOKINGS_SERVICE_NAME)
        private readonly _adminBookingService: IAdminBookingService
    ) { }

    @Get('')
    async getBookings(@Query() getBookingsFilterDto: GetBookingsFilter): Promise<IResponse<IPaginatedBookingsResponse>> {
        return await this._adminBookingService.fetchBookings(getBookingsFilterDto);
    }

    @Get('stats')
    async getBookingStats(): Promise<IResponse<IBookingStats>> {
        return await this._adminBookingService.getBookingStats();
    }

    @Post('download_report')
    async downloadBookingReport(@Res() res: Response, @Body() bookingReportDownloadDto: BookingReportDownloadDto): Promise<void> {
        try {
            const start = Date.now();
            const pdfBuffer = await this._adminBookingService.downloadBookingReport(bookingReportDownloadDto);
            this.logger.debug(`[Admin] - PDF Generation Time: ${Date.now() - start}ms`);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="booking-report.pdf"',
                'Content-Length': pdfBuffer.length,
            });

            res.send(pdfBuffer);
        } catch (err) {
            this.logger.error(`Error downloading booking report: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }


}
