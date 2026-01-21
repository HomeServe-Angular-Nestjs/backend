// service.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProfessionDocument } from './profession.schema';


@Schema({ timestamps: true })
export class ServiceCategoryDocument extends Document {

    @Prop({
        type: String,
        required: true,
        trim: true,
    })
    name: string;

    @Prop({
        type: Types.ObjectId,
        ref: ProfessionDocument.name,
        required: true,
        index: true,
    })
    professionId: Types.ObjectId;

    @Prop({
        type: [String],
        default: [],
    })
    keywords: string[];

    @Prop({
        type: Boolean,
        default: true,
    })
    isActive: boolean;

    @Prop({
        type: Boolean,
        default: false,
    })
    isDeleted: boolean;

    @Prop({ type: Date })
    createdAt?: Date;

    @Prop({ type: Date })
    updatedAt?: Date;
}

export const ServiceCategorySchema = SchemaFactory.createForClass(ServiceCategoryDocument);
ServiceCategorySchema.index({ name: 1 });
ServiceCategorySchema.index({ keywords: 1 });
