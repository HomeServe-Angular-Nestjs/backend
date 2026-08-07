import { ADMIN_SALES_REPORT_SERVICE_NAME } from '@core/constants/service.constant';
import { ISalesReportBundle } from '@core/entities/interfaces/admin.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { AdminRoleGuard } from '@core/guards/admin-role.guard';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { IResponse } from '@core/misc/response.util';
import { SalesReportQueryDto } from '@modules/users/dtos/sales-report.dto';
import { IAdminSalesReportService } from '@modules/users/services/interfaces/admin-sales-report-service.interface';
import { Body, Controller, Get, Inject, InternalServerErrorException, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

@UseGuards(AdminRoleGuard)
@Controller('admin/sales-report')
export class AdminSalesReportController {
    private readonly logger = new CustomLogger(AdminSalesReportController.name);

    constructor(
        @Inject(ADMIN_SALES_REPORT_SERVICE_NAME)
        private readonly _salesReportService: IAdminSalesReportService
    ) { }

    @Get('')
    async getSalesReport(@Query() salesReportQueryDto: SalesReportQueryDto): Promise<IResponse<ISalesReportBundle>> {
        return await this._salesReportService.getSalesReport(salesReportQueryDto);
    }

    @Post('export/pdf')
    async exportSalesReportPdf(@Res() res: Response, @Body() salesReportQueryDto: SalesReportQueryDto): Promise<void> {
        try {
            const start = Date.now();
            const pdfBuffer = await this._salesReportService.downloadSalesReportPdf(salesReportQueryDto);
            this.logger.debug(`[Admin] - Sales Report PDF Generation Time: ${Date.now() - start}ms`);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="sales-report.pdf"',
                'Content-Length': pdfBuffer.length,
            });

            res.send(pdfBuffer);
        } catch (err) {
            this.logger.error(`Error downloading sales report pdf: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('export/excel')
    async exportSalesReportExcel(@Res() res: Response, @Body() salesReportQueryDto: SalesReportQueryDto): Promise<void> {
        try {
            const excelBuffer = await this._salesReportService.downloadSalesReportExcel(salesReportQueryDto);

            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="sales-report.xlsx"',
                'Content-Length': excelBuffer.length,
            });

            res.send(excelBuffer);
        } catch (err) {
            this.logger.error(`Error downloading sales report excel: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }
}
