import { WALLET_MAPPER } from "@core/constants/mappers.constant";
import { WALLET_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { IWalletMapper } from "@core/dto-mapper/interface/wallet.mapper.interface";
import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { IWalletRepository } from "@core/repositories/interfaces/wallet-repo.interface";
import { IWalletService } from "@modules/wallet/services/interfaces/wallet.service.interface";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class WalletService implements IWalletService {
    constructor(
        @Inject(WALLET_REPOSITORY_NAME)
        private readonly _walletRepository: IWalletRepository,
        @Inject(WALLET_MAPPER)
        private readonly _walletMapper: IWalletMapper,

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

    // async getAdminWalletBalance(adminId: string): Promise<IResponse<number>> {
    //     const balance = await this._walletRepository.getAdminAmount(adminId);
    //     return {
    //         success: true,
    //         message: 'Wallet amount fetched',
    //         data: balance
    //     }
    // }
}