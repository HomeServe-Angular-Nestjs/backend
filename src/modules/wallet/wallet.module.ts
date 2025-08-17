import { WalletController } from "@modules/wallet/controller/wallet.controller";
import { walletRepositoryProviders } from "@modules/wallet/providers/repository.providers";
import { walletServiceProviders } from "@modules/wallet/providers/service.providers";
import { Module } from "@nestjs/common";
import { SharedModule } from "@shared/shared.module";

@Module({
    imports: [SharedModule],
    controllers: [WalletController],
    providers: [...walletRepositoryProviders, ...walletServiceProviders]
})
export class WalletModule { }