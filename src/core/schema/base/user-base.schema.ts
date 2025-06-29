import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IAddress } from 'src/core/entities/interfaces/user.entity.interface';

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
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
    address: {
      type: String,
    },
  })
  location: IAddress;

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
