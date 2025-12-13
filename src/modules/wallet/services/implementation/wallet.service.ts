import { WALLET_LEDGER_MAPPER, WALLET_MAPPER } from "@core/constants/mappers.constant";
import { WALLET_LEDGER_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { IWalletLedgerMapper } from "@core/dto-mapper/interface/wallet-ledger.mapper.interface";
import { IWalletMapper } from "@core/dto-mapper/interface/wallet.mapper.interface";
import { ICustomerTransactionDataWithPagination, IProviderTransactionDataWithPagination, IWalletTransactionFilter } from "@core/entities/interfaces/wallet-ledger.entity.interface";
import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";
import { IResponse } from "@core/misc/response.util";
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

    async getTransactions(customerId: string, filter?: ProviderWalletFilterDto): Promise<IResponse<ICustomerTransactionDataWithPagination>> {
        const { page = 1, limit = 10, ...filters } = filter as unknown as {
            page: number;
            limit: number;
        } & IWalletTransactionFilter;

        const [total, transactions] = await Promise.all([
            this._walletLedgerRepository.getTotalLedgerCountByUserId(customerId),
            this._walletLedgerRepository.getFilteredCustomerLedgersByUserIdWithPagination(customerId, filters, { page, limit })
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

    async getFilteredProviderTransactionsWithPagination(providerId: string, filter?: ProviderWalletFilterDto): Promise<IResponse<IProviderTransactionDataWithPagination>> {
        const { page = 1, limit = 10, ...filters } = filter as unknown as {
            page: number;
            limit: number;
        } & IWalletTransactionFilter;

        const [total, transactions] = await Promise.all([
            this._walletLedgerRepository.getTotalLedgerCountByUserId(providerId),
            this._walletLedgerRepository.getFilteredProviderLedgersByUserIdWithPagination(providerId, filters, { page, limit })
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