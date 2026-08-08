import { ITransactionMapper } from "@core/dto-mapper/interface/transaction.mapper.interface";
import { Transaction } from "@core/entities/implementation/transaction.entity";
import { ITransaction } from "@core/entities/interfaces/transaction.entity.interface";
import { TransactionDocument } from "@core/schema/bookings.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class TransactionMapper implements ITransactionMapper {
    toEntity(doc: TransactionDocument): ITransaction {
        return new Transaction({
            id: (doc._id as Types.ObjectId).toString(),
            userId: (doc.userId)?.toString(),
            transactionType: doc.transactionType,
            direction: doc.direction,
            source: doc.source,
            status: doc.status,
            amount: doc.amount,
            currency: doc.currency,
            gateWayDetails: doc.gateWayDetails ? {
                orderId: doc.gateWayDetails.orderId,
                paymentId: doc.gateWayDetails.paymentId,
                signature: doc.gateWayDetails.signature,
                receipt: doc.gateWayDetails.receipt,
            } : null,
            userDetails: doc.userDetails ? {
                email: doc.userDetails.email,
                contact: doc.userDetails.contact,
                role: doc.userDetails.role
            } : null,
            createdAt: doc.createdAt,
            metadata: doc.metadata ? {
                bookingId: doc.metadata?.bookingId?.toString() ?? null,
                subscriptionId: doc.metadata?.subscriptionId?.toString() ?? null,
                breakup: {
                    providerAmount: doc?.metadata?.breakup?.providerAmount ?? null,
                    providerCommission: doc?.metadata?.breakup?.providerCommission ?? null,
                    customerCommission: doc?.metadata?.breakup?.customerCommission ?? null,
                    gst: doc?.metadata?.breakup?.gst ?? null,
                    coupon: doc?.metadata?.breakup?.coupon ? {
                        couponId: doc.metadata.breakup.coupon.couponId?.toString() ?? null,
                        couponCode: doc.metadata.breakup.coupon.couponCode ?? null,
                        couponName: doc.metadata.breakup.coupon.couponName ?? null,
                        discountType: doc.metadata.breakup.coupon.discountType ?? null,
                        discountValue: doc.metadata.breakup.coupon.discountValue ?? null,
                        originalAmount: doc.metadata.breakup.coupon.originalAmount ?? null,
                        deductedValue: doc.metadata.breakup.coupon.deductedValue ?? null,
                    } : null,
                }
            } : null
        });
    }

    toDocument(entity: Partial<ITransaction>): Partial<TransactionDocument> {
        return {
            userId: new Types.ObjectId(entity.userId),
            transactionType: entity.transactionType,
            gateWayDetails: entity.gateWayDetails ? {
                orderId: entity.gateWayDetails.orderId,
                paymentId: entity.gateWayDetails.paymentId,
                signature: entity.gateWayDetails.signature,
                receipt: entity.gateWayDetails.receipt ?? null,
            } : null,
            amount: entity.amount,
            currency: entity.currency,
            userDetails: entity.userDetails ? {
                contact: entity.userDetails.contact,
                email: entity.userDetails.email,
                role: entity.userDetails.role,
            } : null,
            status: entity.status,
            direction: entity.direction,
            source: entity.source,
            metadata: entity?.metadata ? {
                bookingId: entity.metadata?.bookingId
                    ? new Types.ObjectId(entity.metadata.bookingId)
                    : null,
                subscriptionId: entity.metadata?.subscriptionId
                    ? new Types.ObjectId(entity.metadata.subscriptionId)
                    : null,
                breakup: {
                    providerAmount: entity.metadata?.breakup?.providerAmount ?? null,
                    providerCommission: entity.metadata?.breakup?.providerCommission ?? null,
                    customerCommission: entity.metadata?.breakup?.customerCommission ?? null,
                    gst: entity.metadata?.breakup?.gst ?? null,
                    coupon: entity.metadata?.breakup?.coupon ? {
                        couponId: entity.metadata.breakup.coupon.couponId
                            ? new Types.ObjectId(entity.metadata.breakup.coupon.couponId)
                            : null,
                        couponCode: entity.metadata.breakup.coupon.couponCode ?? null,
                        couponName: entity.metadata.breakup.coupon.couponName ?? null,
                        discountType: entity.metadata.breakup.coupon.discountType ?? null,
                        discountValue: entity.metadata.breakup.coupon.discountValue ?? null,
                        originalAmount: entity.metadata.breakup.coupon.originalAmount ?? null,
                        deductedValue: entity.metadata.breakup.coupon.deductedValue ?? null,
                    } : null,
                }
            } : null,
        }
    }
} 