import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";
import { UserType } from "@modules/auth/dtos/login.dto";

export interface IWallet extends IEntity {
    userId: string;
    currency: string;
    balance: number;
    type: UserType;
    lastTransactionDate: Date;
}