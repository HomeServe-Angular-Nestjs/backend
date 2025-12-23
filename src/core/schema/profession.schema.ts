import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";


@Schema({ timestamps: true })
export class ProfessionDocument extends Document {

    @Prop({
        type: String,
        required: true,
        trim: true,
        lowercase:true,
        unique: true,
    })
    name: string;

    @Prop({
        type: Boolean,
        default: false,
    })
    isDeleted: boolean;

    @Prop({
        type: Boolean,
        default: true,
    })
    isActive: boolean;

    @Prop({ type: Date })
    createdAt?: Date;

    @Prop({ type: Date })
    updatedAt?: Date;
}

export const ProfessionSchema = SchemaFactory.createForClass(ProfessionDocument);
ProfessionSchema.index({ name: 1, isDeleted: 1 }, { unique: true });
