import { TRANSACTION_MAPPER, WALLET_MAPPER } from "@core/constants/mappers.constant";
import { TRANSACTION_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ITransactionMapper } from "@core/dto-mapper/interface/transaction.mapper.interface";
import { IWalletMapper } from "@core/dto-mapper/interface/wallet.mapper.interface";
import { ITransactionFilter, ITransactionTableData, ITransactionUserTableData } from "@core/entities/interfaces/transaction.entity.interface";
import { ClientUserType } from "@core/entities/interfaces/user.entity.interface";
import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { ITransactionRepository } from "@core/repositories/interfaces/transaction-repo.interface";
import { IWalletRepository } from "@core/repositories/interfaces/wallet-repo.interface";
import { ProviderWalletFilterDto } from "@modules/wallet/dto/wallet.dto";
import { IWalletService } from "@modules/wallet/services/interfaces/wallet.service.interface";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class WalletService implements IWalletService {
    constructor(
        @Inject(WALLET_REPOSITORY_NAME)
        private readonly _walletRepository: IWalletRepository,
        @Inject(WALLET_MAPPER)
        private readonly _walletMapper: IWalletMapper,
        @Inject(TRANSACTION_REPOSITORY_NAME)
        private readonly _transactionRepository: ITransactionRepository,
        @Inject(TRANSACTION_MAPPER)
        private readonly _transactionMapper: ITransactionMapper,
    ) { }

    async getWallet(userId: string): Promise<IResponse<IWallet | null>> {
        const walletDocument = await this._walletRepository.findWallet(userId);
        const wallet = walletDocument ? this._walletMapper.toEntity(walletDocument) : null;
        return {
            success: !!wallet,
            message: wallet
                ? 'Successfully fetched wallet.'
                : 'Wallet not found.',
            data: wallet
        }
    }

    async getTransactions(userId: string, filter?: ProviderWalletFilterDto): Promise<IResponse<ITransactionUserTableData>> {
        const { page = 1, limit = 10, ...filters } = filter as unknown as {
            page: number;
            limit: number;
        } & ITransactionFilter;

        const [total, transactionDocs] = await Promise.all([
            this._transactionRepository.countByUserId(userId),
            this._transactionRepository.getFilteredTransactionByUserIdWithPagination(userId, filters, { page, limit })
        ]);

        const transactions: (ITransactionTableData & { email: string })[] = (transactionDocs ?? [])
            .map(txn => this._transactionMapper.toEntity(txn))
            .map(tnx => {
                return {
                    transactionId: tnx.id,
                    amount: tnx.amount / 100,
                    createdAt: tnx.createdAt as Date,
                    email: tnx.userDetails?.email ?? '',
                    method: tnx.direction,
                    paymentId: tnx.gateWayDetails?.paymentId ?? '',
                    source: tnx.source,
                    transactionType: tnx.transactionType
                }
            });

        return {
            success: true,
            message: 'Transaction details fetched successfully.',
            data: {
                transactions,
                pagination: { page, total, limit }
            }
        }
    }
}