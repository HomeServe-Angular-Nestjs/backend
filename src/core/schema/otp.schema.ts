import { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class OtpDocument extends Document {
  @Prop({ required: true, index: true })
  email: string;

  @Prop()
  code: string;

  @Prop({ expires: '1m' })
  expiresAt: Date;
}
export const OtpSchema = SchemaFactory.createForClass(OtpDocument);

OtpSchema.index({ email: 1, code: 1 });
