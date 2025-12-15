import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

function toPaisa(value: number): number {
    if (typeof value !== 'number') return value;
    return Math.round(value * 100);
}

@Schema({ timestamps: true })
export class AdminSettingsDocument extends Document {
    @Prop({
        type: Number,
        default: 18
    })
    gstPercentage: number;

    @Prop({
        type: Number,
        default: 10
    })
    providerCommission: number;

    @Prop({
        type: Number,
        default: 10,
    })
    customerCommission: number;

    @Prop({
        type: Number,
        default: 10 * 100,
        set: toPaisa,
    })
    cancellationFee: number;

    @Prop({
        type: Number,
        default: 10 * 100,
        set: toPaisa,
    })
    providerCancellationFine: number;
}
export const AdminSettingSchema = SchemaFactory.createForClass(AdminSettingsDocument);