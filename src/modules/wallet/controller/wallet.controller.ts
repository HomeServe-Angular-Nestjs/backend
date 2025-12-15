import { WALLET_SERVICE_NAME } from "@core/constants/service.constant";
import { User } from "@core/decorators/extract-user.decorator";
import { ICustomerTransactionDataWithPagination, IProviderTransactionDataWithPagination, IProviderTransactionOverview } from "@core/entities/interfaces/wallet-ledger.entity.interface";
import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";
import { IPayload } from "@core/misc/payload.interface";
import { IResponse } from "@core/misc/response.util";
import { ProviderWalletFilterDto } from "@modules/wallet/dto/wallet.dto";
import { IWalletService } from "@modules/wallet/services/interfaces/wallet.service.interface";
import { Controller, Get, Inject, Query } from "@nestjs/common";

@Controller('wallet')
export class WalletController {
    constructor(
        @Inject(WALLET_SERVICE_NAME)
        private readonly _walletService: IWalletService
    ) { }

    @Get('')
    async getWallet(@User() user: IPayload): Promise<IResponse<IWallet | null>> {
        return await this._walletService.getWallet(user.sub);
    }

    @Get('transaction/list')
    async getTransactionList(@User() user: IPayload, @Query() filters: ProviderWalletFilterDto): Promise<IResponse<ICustomerTransactionDataWithPagination>> {
        return await this._walletService.getTransactions(user.sub, filters);
    }

    @Get('provider/transaction/list')
    async getProviderTransactionList(@User() user: IPayload, @Query() filters: ProviderWalletFilterDto): Promise<IResponse<IProviderTransactionDataWithPagination>> {
        return await this._walletService.getFilteredProviderTransactionsWithPagination(user.sub, filters);
    }

    @Get('provider/transaction/overview')
    async getProviderTransactionOverview(@User() user: IPayload): Promise<IResponse<IProviderTransactionOverview>> {
        return await this._walletService.getProviderTransactionOverview(user.sub);
    }
}