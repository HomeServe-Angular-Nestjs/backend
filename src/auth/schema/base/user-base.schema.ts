import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ discriminatorKey: 'kind', timestamps: true })
export class BaseUserDocument extends Document {
    @Prop()
    fullName: string;

    @Prop({ required: true, unique: true, index: true })
    email: string;

    @Prop({ required: true })
    username: string;

    @Prop()
    password: string;

    @Prop()
    phone: string;

    @Prop()
    avatar: string;

    @Prop({ default: null })
    googleId: string;

    @Prop()
    isActive: boolean

    @Prop()
    isBlocked: boolean;

    @Prop()
    isDeleted: boolean;

    @Prop()
    createdAt?: Date;

    @Prop()
    updatedAt?: Date;
}

export const BaseSchema = SchemaFactory.createForClass(BaseUserDocument);