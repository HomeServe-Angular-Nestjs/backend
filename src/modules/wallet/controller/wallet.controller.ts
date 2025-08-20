import { WALLET_SERVICE_NAME } from "@core/constants/service.constant";
import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";
import { IPayload } from "@core/misc/payload.interface";
import { IResponse } from "@core/misc/response.util";
import { IWalletService } from "@modules/wallet/services/interfaces/wallet.service.interface";
import { Controller, Get, Inject, Req } from "@nestjs/common";
import { Request } from "express";

@Controller('wallet')
export class WalletController {
    constructor(
        @Inject(WALLET_SERVICE_NAME)
        private readonly _walletService: IWalletService
    ) { }

    @Get('')
    async getWallet(@Req() req: Request): Promise<IResponse<IWallet | null>> {
        const user = req.user as IPayload;
        return await this._walletService.getWallet(user.sub);
    }
}