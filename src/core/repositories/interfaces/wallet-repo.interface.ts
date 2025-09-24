import { ITransaction } from "@core/entities/interfaces/transaction.entity.interface";
import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { WalletDocument } from "@core/schema/wallet.schema";
import { UserType } from "@modules/auth/dtos/login.dto";

export interface IWalletRepository extends IBaseRepository<WalletDocument> {
    findWallet(userId: string): Promise<WalletDocument | null>;
    updateAdminAmount(amount: number): Promise<boolean>;
    updateUserAmount(userId: string, type: UserType, amount: number): Promise<boolean>;
    updateProviderBalance(providerId: string, amount: number): Promise<boolean>;
    updateCustomerBalance(customerId: string, amount: number): Promise<boolean>;
    bulkUpdate(transaction: ITransaction): Promise<void>
}