import { CUSTOMER_MAPPER, PROVIDER_MAPPER, WALLET_LEDGER_MAPPER } from "@core/constants/mappers.constant";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, TRANSACTION_REPOSITORY_NAME, WALLET_LEDGER_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { PDF_SERVICE } from "@core/constants/service.constant";
import { ICustomerMapper } from "@core/dto-mapper/interface/customer.mapper..interface";
import { IProviderMapper } from "@core/dto-mapper/interface/provider.mapper.interface";
import { IWalletLedgerMapper } from "@core/dto-mapper/interface/wallet-ledger.mapper.interface";
import { ClientUserType, ICustomer, IProvider } from "@core/entities/interfaces/user.entity.interface";
import { IAdminTransactionDataWithPagination, ITransactionAdminList, ITransactionStats, IWalletTransactionFilter } from "@core/entities/interfaces/wallet-ledger.entity.interface";
import { ErrorCodes } from "@core/enum/error.enum";
import { IResponse } from "@core/misc/response.util";
import { ICustomerRepository } from "@core/repositories/interfaces/customer-repo.interface";
import { IProviderRepository } from "@core/repositories/interfaces/provider-repo.interface";
import { ITransactionRepository } from "@core/repositories/interfaces/transaction-repo.interface";
import { IWalletLedgerRepository } from "@core/repositories/interfaces/wallet-ledger.repo.interface";
import { IWalletRepository } from "@core/repositories/interfaces/wallet-repo.interface";
import { CustomerDocument } from "@core/schema/customer.schema";
import { ProviderDocument } from "@core/schema/provider.schema";
import { createTransactionReportTableTemplate, ITransactionTableTemplate } from "@core/services/pdf/mappers/transaction-report.mapper";
import { IPdfService } from "@core/services/pdf/pdf.interface";
import { TransactionReportDownloadDto } from "@modules/users/dtos/admin-user.dto";
import { IAdminTransactionService } from "@modules/users/services/interfaces/admin-transaction-service.interface";
import { ProviderWalletFilterDto } from "@modules/wallet/dto/wallet.dto";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class AdminTransactionService implements IAdminTransactionService {

    constructor(
        @Inject(TRANSACTION_REPOSITORY_NAME)
        private readonly _transactionRepository: ITransactionRepository,
        @Inject(PDF_SERVICE)
        private readonly _pdfService: IPdfService,
        @Inject(WALLET_LEDGER_REPOSITORY_NAME)
        private readonly _walletLedgerRepository: IWalletLedgerRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(CUSTOMER_MAPPER)
        private readonly _customerMapper: ICustomerMapper,
        @Inject(PROVIDER_MAPPER)
        private readonly _providerMapper: IProviderMapper,
        @Inject(WALLET_REPOSITORY_NAME)
        private readonly _walletRepository: IWalletRepository,
    ) { }

    private async _getUserDetails(userId: string, role: ClientUserType | null): Promise<ICustomer | IProvider | null> {
        if (!role) return null;
        const repo = role === 'customer' ? this._customerRepository : this._providerRepository;
        const userDoc = await repo.findById(userId);

        if (!userDoc) return null;

        return role === 'customer'
            ? this._customerMapper.toEntity(userDoc as CustomerDocument)
            : this._providerMapper.toEntity(userDoc as ProviderDocument);
    }

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
        const [stats, wallet] = await Promise.all([
            this._walletLedgerRepository.getTransactionStats(),
            this._walletRepository.getAdminWallet()
        ]);

        const balance = wallet?.balance ?? 0;

        return {
            success: true,
            message: 'Transaction stats fetched successfully',
            data: { ...stats, balance: balance / 100 },
        }
    }

    async getTransactionLists(adminId: string, filterData: ProviderWalletFilterDto): Promise<IResponse<IAdminTransactionDataWithPagination>> {
        const { page = 1, limit = 10, ...filters } = filterData as unknown as {
            page: number;
            limit: number;
        } & IWalletTransactionFilter;

        const [total, transactionDocs] = await Promise.all([
            this._walletLedgerRepository.count(),
            this._walletLedgerRepository.getAdminTransactionLists(filters, { page, limit })
        ]);

        const enrichedTransaction: ITransactionAdminList[] = await Promise.all(
            (transactionDocs ?? []).map(async (tnxDoc) => {
                const role = tnxDoc.userRole;
                const userId = tnxDoc.userId.toString();

                let user: ICustomer | IProvider | null = null;

                if (adminId !== userId) {
                    user = await this._getUserDetails(
                        userId,
                        tnxDoc.userRole as ClientUserType
                    );

                    if (!user) {
                        throw new NotFoundException({
                            code: ErrorCodes.NOT_FOUND,
                            message: 'User not found',
                        });
                    }
                }

                return {
                    dateTime: tnxDoc.createdAt.toString(),
                    counterparty: {
                        email: user?.email ?? '',
                        role: role ?? 'admin',
                    },
                    type: tnxDoc.type,
                    direction: tnxDoc.direction,
                    amount: tnxDoc.amount / 100,
                    referenceType: tnxDoc.bookingId ? 'booking' : tnxDoc.subscriptionId ? 'subscription' : 'Internal',
                    referenceId: tnxDoc.bookingId?.toString() || tnxDoc.subscriptionId?.toString() || '',
                    source: tnxDoc.source,
                };
            })
        );

        return {
            success: true,
            message: 'Transaction lists fetched successfully',
            data: {
                transactions: enrichedTransaction,
                pagination: { page, total, limit }
            }
        }
    }
}