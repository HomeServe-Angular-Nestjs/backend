import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseUserDocument } from "./base/user-base.schema";

@Schema({
    timestamps: true,
})
export class CustomerDocument extends BaseUserDocument {
    @Prop({
        type: [{ lat: Number, lng: Number }],
        index: true
    })
    locations: {
        lat: number;
        lng: number;
    }[];

    @Prop({
        type: [String],
        required: true
    })
    savedProviders: string[];
}
export const CustomerSchema = SchemaFactory.createForClass(CustomerDocument);
