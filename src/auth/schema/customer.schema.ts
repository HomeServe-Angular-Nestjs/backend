import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
    timestamps: true,
})
export class CustomerDocument extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    password: string;

    @Prop()
    username: string;

    @Prop()
    fullname: string;

    @Prop()
    phone: number;

    @Prop()
    avatar: string;

    @Prop()
    isVerified: string;

    @Prop()
    isActive: boolean;

    @Prop()
    isBlocked: boolean;

    @Prop()
    isDeleted: boolean;

    @Prop()
    lastLoginAt: Date;
}
export const CustomerSchema = SchemaFactory.createForClass(CustomerDocument);