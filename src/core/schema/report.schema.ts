import { ReportedType } from "@core/entities/interfaces/report.entity.interface";
import { ReportStatus } from "@core/enum/report.enum";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class ReportDocument extends Document {
    @Prop({
        type: Types.ObjectId,
        required: true
    })
    reportedId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        required: true
    })
    targetId: Types.ObjectId;

    @Prop({
        type: String,
        enum: ['customer', 'provider'],
        required: true
    })
    type: ReportedType;

    @Prop({
        type: String,
        required: true
    })
    reason: string;

    @Prop({
        type: String,
        required: true
    })
    description: string;

    @Prop({
        type: String,
        required: true,
        enum: Object.values(ReportStatus)
    })
    status: ReportStatus;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(ReportDocument);