import { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class AdminDocument extends Document {
  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String })
  fullname: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AdminSchema = SchemaFactory.createForClass(AdminDocument);