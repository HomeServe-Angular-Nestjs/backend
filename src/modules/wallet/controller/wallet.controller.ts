import { WALLET_SERVICE_NAME } from "@core/constants/service.constant";
import { ITransactionUserTableData } from "@core/entities/interfaces/transaction.entity.interface";
import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";
import { IPayload } from "@core/misc/payload.interface";
import { IResponse } from "@core/misc/response.util";
import { ProviderWalletFilterDto } from "@modules/wallet/dto/wallet.dto";
import { IWalletService } from "@modules/wallet/services/interfaces/wallet.service.interface";
import { Controller, Get, Inject, Query, Req } from "@nestjs/common";
import { Request } from "express";

@Controller('wallet')
export class WalletController {
    constructor(
        @Inject(WALLET_SERVICE_NAME)
        private readonly _walletService: IWalletService
    ) { }

    private _getUser(req: Request): IPayload {
        return req.user as IPayload;
    }

    @Get('')
    async getWallet(@Req() req: Request): Promise<IResponse<IWallet | null>> {
        const user = req.user as IPayload;
        return await this._walletService.getWallet(user.sub);
    }

    @Get('transaction/list')
    async getTransactionList(@Req() req: Request, @Query() filters: ProviderWalletFilterDto): Promise<IResponse<ITransactionUserTableData>> {
        const user = this._getUser(req);
        return await this._walletService.getTransactions(user.sub, filters);
    }
}