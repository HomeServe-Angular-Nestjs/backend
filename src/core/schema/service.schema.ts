import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SubService, SubServiceSchema } from './subservice.schema';

@Schema({ timestamps: true })
export class ServiceDocument extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  desc: string;

  @Prop()
  image: string;

  @Prop({ type: [SubServiceSchema], default: [] })
  subService: SubService[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isVerified: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(ServiceDocument);
