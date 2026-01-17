import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class ReservationDocument extends Document {

    @Prop({
        type: String,
        required: true,
    })
    from: string;

    @Prop({
        type: String,
        required: true,
    })
    to: string;

    @Prop({
        type: Date,
        required: true,
    })
    date: Date;

    @Prop({
        type: Types.ObjectId,
        required: true,
    })
    providerId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true,
    })
    customerId: Types.ObjectId;

    @Prop({ type: Date, expires: 15 * 60 })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(ReservationDocument);
ReservationSchema.index(
    {
        'from': 1,
        'to': 1,
        'date': 1,
        'providerId': 1
    },
    {
        unique: true,
        name: 'uniq_reservation_slot'
    }
); 
