import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AdminDocument extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const AdminSchema = SchemaFactory.createForClass(AdminDocument);
