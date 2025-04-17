import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class SubService {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    desc: string;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    estimatedTime: string;

    @Prop()
    image: string;

    @Prop()
    tag: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isDeleted: boolean;
}

export const SubServiceSchema = SchemaFactory.createForClass(SubService);