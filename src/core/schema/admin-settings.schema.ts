import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

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
        default: 10
    })
    customerCommission: number;
}
export const AdminSettingSchema = SchemaFactory.createForClass(AdminSettingsDocument);