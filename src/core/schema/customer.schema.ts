import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseUserDocument } from './base/user-base.schema';

@Schema({ timestamps: true })
export class CustomerDocument extends BaseUserDocument {
  @Prop({
    type: [String],
    required: true,
  })
  savedProviders: string[];

  @Prop({ type: Boolean, default: false })
  isReviewed: boolean;
}
export const CustomerSchema = SchemaFactory.createForClass(CustomerDocument);
