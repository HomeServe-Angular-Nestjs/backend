import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CUSTOMER_MODEL_NAME, PROVIDER_SERVICE_MODEL_NAME } from '@core/constants/model.constant';
import { ProviderServicePopulatedDocument } from '@core/schema/provider-service.schema';


@Schema({ timestamps: true })
export class CartDocument extends Document {
    @Prop({
        type: Types.ObjectId,
        ref: CUSTOMER_MODEL_NAME,
        required: true,
        unique: true,
        index: true
    })
    customerId: Types.ObjectId;

    @Prop({
        type: [{
            type: Types.ObjectId,
            ref: PROVIDER_SERVICE_MODEL_NAME
        }],
        default: []
    })
    items: Types.ObjectId[];

    @Prop({ type: Date })
    createdAt?: Date;

    @Prop({ type: Date })
    updatedAt?: Date;
}

export const CartSchema = SchemaFactory.createForClass(CartDocument);

export interface CartPopulatedDocument extends Omit<CartDocument, 'items'> {
    items: ProviderServicePopulatedDocument[];
}
