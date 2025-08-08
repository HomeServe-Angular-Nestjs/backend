import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class BookedSlotDocument extends Document {
    @Prop({
        type: Types.ObjectId,
        required: true
    })
    providerId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true,
        index: true
    })
    ruleId: Types.ObjectId;

    @Prop({
        type: String,
        required: true
    })
    from: string;

    @Prop({
        type: String,
        required: true
    })
    to: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const BookedSlotSchema = SchemaFactory.createForClass(BookedSlotDocument);