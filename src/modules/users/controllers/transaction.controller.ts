import { ADMIN_TRANSACTION_SERVICE_NAME } from "@core/constants/service.constant";
import { ErrorMessage } from "@core/enum/error.enum";
import { ICustomLogger } from "@core/logger/interface/custom-logger.interface";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { TransactionReportDownloadDto } from "@modules/users/dtos/admin-user.dto";
import { IAdminTransactionService } from "@modules/users/services/interfaces/admin-transaction-service.interface";
import { Body, Controller, Inject, InternalServerErrorException, Post, Res } from "@nestjs/common";
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
        try {
            const start = Date.now();
            const pdfBuffer = await this._adminTransactionService.downloadTransactionReport(dto);
            this.logger.debug(`[Admin] - PDF Generation Time: ${Date.now() - start}ms`);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="booking-report.pdf"',
                'Content-Length': pdfBuffer.length,
            }); 

            res.send(pdfBuffer);
        } catch (err) {
            this.logger.error(`Error downloading transaction report: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }
}