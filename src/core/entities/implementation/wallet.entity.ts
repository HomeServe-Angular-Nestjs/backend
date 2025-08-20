import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";

export class Wallet extends BaseEntity implements IWallet {
    userId: string;
    currency: string;
    balance: number;
    lastTransactionDate: Date;

    constructor(partial: Partial<Wallet>) {
        super(partial);
        Object.assign(this, partial);
    }
}