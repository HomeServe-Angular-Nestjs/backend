import { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class AdminDocument extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Boolean, default: false })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({})
  createdAt: Date;

  @Prop({})
  updatedAt: Date
}

export const AdminSchema = SchemaFactory.createForClass(AdminDocument);
