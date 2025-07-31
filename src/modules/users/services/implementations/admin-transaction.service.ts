import { TRANSACTION_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { PDF_SERVICE } from "@core/constants/service.constant";
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
        private readonly _pdfService: IPdfService
    ) { }

    async downloadTransactionReport(reportFilterData: TransactionReportDownloadDto): Promise<Buffer> {
        const { category, ...reportDownloadData } = { ...reportFilterData };

        const transactionReportDetails = await this._transactionRepository.getReportDetails(reportDownloadData);
        const transactionColumns = ['Transaction ID', 'User ID', 'Email', 'Contact', 'Amount (₹)', 'Method', 'Type', 'Date'];
        console.log(transactionReportDetails)
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
}