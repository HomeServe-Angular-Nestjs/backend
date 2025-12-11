import { BOOKINGS_MODEL_NAME, SUBSCRIPTION_MODEL_NAME, WALLET_MODEL_NAME } from "@core/constants/model.constant";
import { UserType } from "@core/entities/interfaces/user.entity.interface";
import { CurrencyType, PaymentDirection, PaymentSource, TransactionType } from "@core/enum/transaction.enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Schema as MongooseSchema, Document } from "mongoose";

@Schema({ timestamps: true })
export class WalletLedgerDocument extends Document {
    @Prop({ required: true, type: Types.ObjectId, ref: WALLET_MODEL_NAME })
    walletId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId })
    userId: Types.ObjectId;

    @Prop({ type: String, enum: ['admin', 'provider', 'customer'], required: false, default: null })
    userRole: UserType | null;

    @Prop({ type: String, enum: PaymentDirection, required: true })
    direction: PaymentDirection;

    @Prop({ type: String, enum: TransactionType, required: true })
    type: TransactionType;

    @Prop({ type: Number, required: true })
    amount: number;

    @Prop({ type: String, enum: Object.values(CurrencyType), required: true })
    currency: CurrencyType;

    @Prop({ type: Number, required: true, default: 0 })
    balanceBefore: number;

    @Prop({ type: Number, required: true, default: 0 })
    balanceAfter: number;

    @Prop({ type: String, required: false, default: null })
    journalId: string | null;

    @Prop({ type: Types.ObjectId, ref: BOOKINGS_MODEL_NAME, required: false, default: null })
    bookingId: Types.ObjectId | null;

    @Prop({ type: Types.ObjectId, ref: SUBSCRIPTION_MODEL_NAME, required: false, default: null })
    subscriptionId: Types.ObjectId | null;

    @Prop({ type: Types.ObjectId, required: false, default: null })
    bookingTransactionId: Types.ObjectId | null;

    @Prop({ type: Types.ObjectId, required: false, default: null })
    subscriptionTransactionId: Types.ObjectId | null;

    @Prop({ type: String, required: false, default: null })
    gatewayOrderId: string | null;

    @Prop({ type: String, required: false, default: null })
    gatewayPaymentId: string | null;

    @Prop({ type: String, enum: Object.values(PaymentSource), required: true })
    source: PaymentSource;

    @Prop({ type: MongooseSchema.Types.Mixed, required: false })
    metadata?: Record<string, any>;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const WalletLedgerSchema = SchemaFactory.createForClass(WalletLedgerDocument);