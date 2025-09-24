import { TRANSACTION_MAPPER } from "@core/constants/mappers.constant";
import { TRANSACTION_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { PDF_SERVICE } from "@core/constants/service.constant";
import { ITransactionMapper } from "@core/dto-mapper/interface/transaction.mapper.interface";
import { ITransactionDataWithPagination, ITransactionStats } from "@core/entities/interfaces/transaction.entity.interface";
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

    async getTransactionTableData(page: number): Promise<IResponse<ITransactionDataWithPagination>> {
        page = page || 1;
        const limit = 10;
        const skip = (page - 1) * limit
        const [transactionDocument, totalTransactions] = await Promise.all([
            this._transactionRepository.fetchTransactionsWithPagination(page, limit, skip),
            this._transactionRepository.count()
        ]);
        const transactions = transactionDocument.map(doc => this._transactionMapper.toEntity(doc));

        const tableData = (transactions ?? []).map(transaction => ({
            transactionId: transaction.id,
            orderId: transaction.gateWayDetails ? transaction.gateWayDetails.orderId : '',
            paymentId: transaction.gateWayDetails ? transaction.gateWayDetails.paymentId : '',
            amount: transaction.amount,
            userId: transaction.userId,
            userEmail: transaction.userDetails ? transaction.userDetails.email : '',
            contact: transaction.userDetails ? transaction.userDetails.contact : '',
            method: transaction.direction,
            transactionType: transaction.transactionType,
            createdAt: transaction.createdAt as Date
        }));

        return {
            success: true,
            message: 'Transaction table data fetched successfully',
            data: {
                tableData,
                pagination: {
                    page,
                    limit,
                    total: totalTransactions
                }
            },
        }
    }
}