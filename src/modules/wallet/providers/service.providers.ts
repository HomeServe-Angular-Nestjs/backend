import { WALLET_SERVICE_NAME } from "@core/constants/service.constant";
import { WalletService } from "@modules/wallet/services/implementation/wallet.service";
import { Provider } from "@nestjs/common";

export const walletServiceProviders: Provider[] = [
    {
        provide: WALLET_SERVICE_NAME,
        useClass: WalletService
    }
]
