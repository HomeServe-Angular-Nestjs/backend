import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";
import { UserType } from "@modules/auth/dtos/login.dto";

export class Wallet extends BaseEntity implements IWallet {
    userId: string;
    currency: string;
    balance: number;
    type: UserType;
    lastTransactionDate: Date;

    constructor(partial: Partial<Wallet>) {
        super(partial);
        Object.assign(this, partial);
    }
}