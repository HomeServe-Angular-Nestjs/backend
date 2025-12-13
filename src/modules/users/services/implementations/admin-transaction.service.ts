import { TRANSACTION_MAPPER } from "@core/constants/mappers.constant";
import { TRANSACTION_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { PDF_SERVICE } from "@core/constants/service.constant";
import { ITransactionMapper } from "@core/dto-mapper/interface/transaction.mapper.interface";
import { ITransactionStats } from "@core/entities/interfaces/transaction.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { ITransactionRepository } from "@core/repositories/interfaces/transaction-repo.interface";
import { createTransactionReportTableTemplate, ITransactionTableTemplate } from "@core/services/pdf/mappers/transaction-report.mapper";
import { IPdfService } from "@core/services/pdf/pdf.interface";
import { TransactionReportDownloadDto } from "@modules/users/dtos/admin-user.dto";
import { IAdminTransactionService } from "@modules/users/services/interfaces/admin-transaction-service.interface";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class AdminTransactionService implements IAdminTransactionService {

    constructor(
        @Inject(TRANSACTION_REPOSITORY_NAME)
        private readonly _transactionRepository: ITransactionRepository,
        @Inject(PDF_SERVICE)
        private readonly _pdfService: IPdfService,
        @Inject(TRANSACTION_MAPPER)
        private readonly _transactionMapper: ITransactionMapper,
    ) { }

    async downloadTransactionReport(reportFilterData: TransactionReportDownloadDto): Promise<Buffer> {
        const { category, ...reportDownloadData } = { ...reportFilterData };

        const transactionReportDetails = await this._transactionRepository.getReportDetails(reportDownloadData);
        const transactionColumns = ['Transaction ID', 'User ID', 'Email', 'Contact', 'Amount (₹)', 'Method', 'Type', 'Date'];

        const tableData: ITransactionTableTemplate[] = [
            {
                rows: transactionReportDetails,
                columns: transactionColumns,
                type: 'normal'
            }
        ];

        const tables = createTransactionReportTableTemplate(tableData);
        return this._pdfService.generatePdf(tables, 'Transaction Report');
    }

    async getTransactionStats(): Promise<IResponse<ITransactionStats>> {
        const stats = await this._transactionRepository.getTransactionStats();
        return {
            success: true,
            message: 'Transaction stats fetched successfully',
            data: stats,
        }
    }
}