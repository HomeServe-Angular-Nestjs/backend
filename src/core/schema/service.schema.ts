import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { PROVIDER_MODEL_NAME } from "../constants/model.constant";
import { ProviderDocument } from "./provider.schema";
import { SubService, SubServiceSchema } from "./subservice.schema";

@Schema({ timestamps: true })
export class ServiceDocument extends Document {

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    desc: string;

    @Prop()
    image: string;

    @Prop({ type: [SubServiceSchema], default: [] })
    subService: SubService[];

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: true })
    isVerified: boolean;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ type: Types.ObjectId, ref: PROVIDER_MODEL_NAME })
    provider: Types.ObjectId | ProviderDocument
}

export const ServiceSchema = SchemaFactory.createForClass(ServiceDocument);