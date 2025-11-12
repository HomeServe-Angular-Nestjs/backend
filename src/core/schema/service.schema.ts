import { Document, Types } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { SubServiceDocument, SubServiceSchema } from './subservice.schema';

@Schema({ timestamps: true })
export class ServiceDocument extends Document {

  @Prop({ type: Types.ObjectId, required: true })
  providerId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  desc: string;

  @Prop()
  image: string;

  @Prop({ type: [SubServiceSchema], default: [] })
  subService: SubServiceDocument[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(ServiceDocument);
