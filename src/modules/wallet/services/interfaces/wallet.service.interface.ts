import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";
import { IResponse } from "@core/misc/response.util";

export interface IWalletService {
    getWallet(userId: string): Promise<IResponse<IWallet | null>>;
}