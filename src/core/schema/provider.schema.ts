import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseUserDocument } from './base/user-base.schema';
import { Types } from 'mongoose';
import { SERVICE_OFFERED_MODEL_NAME } from '../constants/model.constant';
import { SubServiceDocument } from './subservice.schema';

@Schema({ timestamps: true })
export class ProviderDocument extends BaseUserDocument {
  @Prop()
  bio: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({
    type: [
      {
        specialization: { type: String },
        label: { type: String },
        tag: { type: String },
      },
    ],
  })
  expertise: {
    specialization: string;
    label: string;
    tag: string;
  }[];

  @Prop({ type: [String] })
  additionalSkills: string[];

  @Prop({ type: [String] })
  languages: string[];

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      zipcode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    index: true,
  })
  location: {
    street: string;
    city: string;
    state: string;
    zipcode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };

  @Prop({ type: [String] })
  workImages: string[];

  @Prop({ type: [String] })
  awards: string[];

  @Prop({ default: false })
  isCertified: boolean;

  @Prop({
    type: {
      pcc: {
        fileUrl: String,
        uploadedAt: Date,
      },
      additionalDocs: [
        {
          type: { type: String },
          fileUrl: String,
          uploadedAt: Date,
        },
      ],
      verificationStatus: String,
      verifiedAt: Date,
    },
  })
  verification: {
    pcc: {
      fileUrl: string;
      uploadedAt: Date;
    };
    additionalDocs: {
      type: string;
      fileUrl: string;
      uploadedAt: Date;
    }[];
    verificationStatus: string;
    verifiedAt: Date;
  };

  @Prop({
    type: [{ type: Types.ObjectId, ref: SERVICE_OFFERED_MODEL_NAME }],
    default: []
  })
  servicesOffered: (Types.ObjectId | SubServiceDocument)[];

  @Prop({ type: [String] })
  schedules: string[];

  @Prop({ default: null })
  subscriptionID: string;
}

export const ProviderSchema = SchemaFactory.createForClass(ProviderDocument);
