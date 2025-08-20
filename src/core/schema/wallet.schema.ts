import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({ timestamps: true })
export class WalletDocument extends Document {
    @Prop({
        type: Types.ObjectId,
        required: true,
        unique: true,
        index: true,
    })
    userId: Types.ObjectId;

    @Prop({
        type: Number,
        required: true,
        default: 0,
        min: 0
    })
    balance: number;

    @Prop({
        type: String,
        required: true,
        default: 'INR'
    })
    currency: string;

    @Prop({ type: Date })
    lastTransactionDate: Date;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const WalletSchema = SchemaFactory.createForClass(WalletDocument);