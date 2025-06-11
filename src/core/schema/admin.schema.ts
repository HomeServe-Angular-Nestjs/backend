import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const AdminSchema = SchemaFactory.createForClass(AdminDocument);
