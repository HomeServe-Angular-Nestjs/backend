import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";

export interface IWallet extends IEntity {
    userId: string;
    currency: string;
    balance: number;
    lastTransactionDate: Date;
}