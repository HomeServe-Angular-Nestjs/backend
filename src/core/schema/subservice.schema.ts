import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SubServiceDocument extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  desc: string;

  @Prop({ required: true })
  price: string;

  @Prop({ required: true })
  estimatedTime: string;

  @Prop()
  image: string;

  @Prop()
  tag: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SubServiceSchema =
  SchemaFactory.createForClass(SubServiceDocument);
