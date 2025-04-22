import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ discriminatorKey: 'kind', timestamps: true })
export class BaseUserDocument extends Document {
  @Prop()
  fullname: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  username: string;

  @Prop()
  password: string;

  @Prop()
  phone: string;

  @Prop()
  avatar: string;

  @Prop({ default: null })
  googleId: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const BaseSchema = SchemaFactory.createForClass(BaseUserDocument);
