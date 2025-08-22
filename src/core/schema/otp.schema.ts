import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class OtpDocument extends Document {
  @Prop({
    type: String,
    required: true,
    index: true
  })
  email: string;

  @Prop({
    type: String,
    required: true
  })
  code: string;

  @Prop({
    type: Date,
    expires: 60,
  })
  createdAt: Date;
}
export const OtpSchema = SchemaFactory.createForClass(OtpDocument);
