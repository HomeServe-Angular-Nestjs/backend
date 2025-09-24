import { IWalletMapper } from "@core/dto-mapper/interface/wallet.mapper.interface";
import { Wallet } from "@core/entities/implementation/wallet.entity";
import { IWallet } from "@core/entities/interfaces/wallet.entity.interface";
import { WalletDocument } from "@core/schema/wallet.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class WalletMapper implements IWalletMapper {
    toEntity(doc: WalletDocument): IWallet {
        return new Wallet({
            id: (doc._id as Types.ObjectId).toString(),
            userId: (doc.userId as Types.ObjectId).toString(),
            balance: doc.balance,
            currency: doc.currency,
            type: doc.type,
            lastTransactionDate: doc.lastTransactionDate,
            createdAt: doc.createdAt
        });
    }

    toDocument(entity: Partial<IWallet>): Partial<WalletDocument> {
        return {
            userId: new Types.ObjectId(entity.userId),
            type: entity.type,
        }
    }
}