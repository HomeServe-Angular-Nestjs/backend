import { IWalletLedgerMapper } from "@core/dto-mapper/interface/wallet-ledger.mapper.interface";
import { WalletLedger } from "@core/entities/implementation/wallet-ledger.entity";
import { ITransactionMetadata } from "@core/entities/interfaces/transaction.entity.interface";
import { IWalletLedger, LedgerMetadataType } from "@core/entities/interfaces/wallet-ledger.entity.interface";
import { WalletLedgerDocument } from "@core/schema/wallet-ledger.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class WalletLedgerMapper implements IWalletLedgerMapper {

    toEntity(doc: WalletLedgerDocument): IWalletLedger {
        return new WalletLedger({
            walletId: (doc._id as Types.ObjectId).toString(),
            userId: (doc.userId as Types.ObjectId).toString(),
            userRole: doc.userRole,
            direction: doc.direction,
            type: doc.type,
            amount: doc.amount,
            currency: doc.currency,
            balanceBefore: doc.balanceBefore,
            balanceAfter: doc.balanceAfter,
            journalId: doc.journalId,
            bookingId: doc.bookingId ? (doc.bookingId as Types.ObjectId).toString() : null,
            subscriptionId: doc.subscriptionId ? (doc.subscriptionId as Types.ObjectId).toString() : null,
            bookingTransactionId: doc.bookingTransactionId ? (doc.bookingTransactionId as Types.ObjectId).toString() : null,
            subscriptionTransactionId: doc.subscriptionTransactionId ? (doc.subscriptionTransactionId as Types.ObjectId).toString() : null,
            gatewayOrderId: doc.gatewayOrderId,
            gatewayPaymentId: doc.gatewayPaymentId,
            source: doc.source,
            metadata: doc?.metadata ?? null,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    toDocument(entity: IWalletLedger): Partial<WalletLedgerDocument> {
        return {
            walletId: new Types.ObjectId(entity.walletId),
            userId: new Types.ObjectId(entity.userId),
            type: entity.type,
            amount: entity.amount,
            currency: entity.currency,
            balanceBefore: entity.balanceBefore,
            balanceAfter: entity.balanceAfter,
            journalId: entity.journalId,
            bookingId: entity.bookingId ? new Types.ObjectId(entity.bookingId) : null,
            subscriptionId: entity.subscriptionId ? new Types.ObjectId(entity.subscriptionId) : null,
            bookingTransactionId: entity.bookingTransactionId ? new Types.ObjectId(entity.bookingTransactionId) : null,
            subscriptionTransactionId: entity.subscriptionTransactionId ? new Types.ObjectId(entity.subscriptionTransactionId) : null,
            gatewayOrderId: entity.gatewayOrderId,
            gatewayPaymentId: entity.gatewayPaymentId,
            source: entity.source,
            metadata: this.mapTransactionMetadataToLedgerMetadata(entity.metadata),
            userRole: entity.userRole,
            direction: entity.direction,
        }
    }

    mapTransactionMetadataToLedgerMetadata(metadata?: ITransactionMetadata | null | undefined): LedgerMetadataType | null {
        if (!metadata) return null;
        return {
            breakup: {
                providerAmount: metadata?.breakup?.providerAmount ?? 0,
                providerCommission: metadata?.breakup?.commission ?? 0,
                customerCommission: metadata?.breakup?.commission ?? 0,
                gst: metadata?.breakup?.gst ?? 0
            }
        }
    }

}