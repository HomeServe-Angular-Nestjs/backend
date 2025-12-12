import { TRANSACTION_MAPPER, WALLET_LEDGER_MAPPER, WALLET_MAPPER } from "@core/constants/mappers.constant";
import { TRANSACTION_REPOSITORY_NAME, WALLET_LEDGER_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ITransactionMapper } from "@core/dto-mapper/interface/transaction.mapper.interface";
import { IWalletLedgerMapper } from "@core/dto-mapper/interface/wallet-ledger.mapper.interface";
import { IWalletMapper } from "@core/dto-mapper/interface/wallet.mapper.interface";
import { ITransactionTableData, ITransactionUserTableData } from "@core/entities/interfaces/transaction.entity.interface";
import { IWalletTransactionFilter } from "@core/entities/interfaces/wallet-ledger.entity.interface";
import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { ITransactionRepository } from "@core/repositories/interfaces/transaction-repo.interface";
import { IWalletLedgerRepository } from "@core/repositories/interfaces/wallet-ledger.repo.interface";
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
        @Inject(WALLET_LEDGER_REPOSITORY_NAME)
        private readonly _walletLedgerRepository: IWalletLedgerRepository,
        @Inject(WALLET_LEDGER_MAPPER)
        private readonly _walletLedgerMapper: IWalletLedgerMapper,
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
        } & IWalletTransactionFilter;

        const [total, transactions] = await Promise.all([
            this._walletLedgerRepository.getTotalLedgerCountByUserId(userId),
            this._walletLedgerRepository.getFilteredLedgersByUserIdWithPagination(userId, filters, { page, limit })
        ]);

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