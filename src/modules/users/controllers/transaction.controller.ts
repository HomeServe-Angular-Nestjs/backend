import { ADMIN_TRANSACTION_SERVICE_NAME } from "@core/constants/service.constant";
import { ITransactionStats, ITransactionDataWithPagination } from "@core/entities/interfaces/transaction.entity.interface";
import { ICustomLogger } from "@core/logger/interface/custom-logger.interface";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { IResponse } from "@core/misc/response.util";
import { PageDto, TransactionReportDownloadDto } from "@modules/users/dtos/admin-user.dto";
import { IAdminTransactionService } from "@modules/users/services/interfaces/admin-transaction-service.interface";
import { Body, Controller, Get, Inject, Post, Query, Res } from "@nestjs/common";
import { Response } from "express";

@Controller('admin/transactions')
export class AdminTransactionController {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(ADMIN_TRANSACTION_SERVICE_NAME)
        private readonly _adminTransactionService: IAdminTransactionService
    ) {
        this.logger = this._loggerFactory.createLogger(AdminTransactionController.name);
    }

    @Post('download_report')
    async downloadTransactionReport(@Res() res: Response, @Body() dto: TransactionReportDownloadDto): Promise<void> {
        const start = Date.now();
        const pdfBuffer = await this._adminTransactionService.downloadTransactionReport(dto);
        this.logger.debug(`[Admin] - PDF Generation Time: ${Date.now() - start}ms`);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="booking-report.pdf"',
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);
    }

    @Get('stats')
    async getTransactionStats(): Promise<IResponse<ITransactionStats>> {
        return await this._adminTransactionService.getTransactionStats();
    }

    @Get('table_data')
    async getTransactionTableData(@Query() { page }: PageDto): Promise<IResponse<ITransactionDataWithPagination>> {
        return await this._adminTransactionService.getTransactionTableData(page);
    }
}