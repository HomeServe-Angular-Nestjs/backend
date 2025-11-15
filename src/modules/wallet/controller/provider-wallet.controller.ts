import { WALLET_SERVICE_NAME } from '@core/constants/service.constant';
import { User } from '@core/decorators/extract-user.decorator';
import { IPayload } from '@core/misc/payload.interface';
import { ProviderWalletFilterDto } from '@modules/wallet/dto/provider-wallet.dto';
import { IWalletService } from '@modules/wallet/services/interfaces/wallet.service.interface';
import { Controller, Get, Inject, Query } from '@nestjs/common';

@Controller('provider/transaction')
export class ProviderWalletController {

    constructor(
        @Inject(WALLET_SERVICE_NAME)
        private readonly _walletService: IWalletService
    ) { }

    @Get('list')
    async getProviderTransactions(@User() user: IPayload, @Query() query: ProviderWalletFilterDto) {
        return await this._walletService.getTransactions(user.sub, query);
    }
}
