import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class LocationDocument {
  @Prop({
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true,
  })
  type: string;

  @Prop({
    type: [Number],
    required: true, // [longitude, latitude]
  })
  coordinates: [number, number];
}

export const LocationSchema = SchemaFactory.createForClass(LocationDocument);



@Schema({ discriminatorKey: 'kind', timestamps: true })
export class BaseUserDocument extends Document {
  @Prop({ type: String })
  fullname: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  email: string;

  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: String })
  avatar: string;

  @Prop({ type: String, default: null })
  googleId: string;

  @Prop({
    type: LocationSchema,
    required: true,
  })
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  @Prop({ type: String })
  address: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const BaseSchema = SchemaFactory.createForClass(BaseUserDocument);