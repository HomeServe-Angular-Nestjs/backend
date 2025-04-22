import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseUserDocument } from './base/user-base.schema';
import { Types } from 'mongoose';
import { SERVICE_OFFERED_MODEL_NAME } from '../constants/model.constant';
import { ServiceDocument } from './service.schema';

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
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipcode: { type: String },
      geo: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          index: '2dsphere',
          required: true,
        },
      },
    },
  })
  location: {
    street: string;
    city: string;
    state: string;
    zipcode: string;
    geo: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
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
        fileUrl: { type: String },
        uploadedAt: { type: Date },
      },
      additionalDocs: [
        {
          docType: { type: String },
          fileUrl: { type: String },
          uploadedAt: { type: Date },
        },
      ],
      verificationStatus: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null },
    },
  })
  verification: {
    pcc: {
      fileUrl: string;
      uploadedAt: Date;
    };
    additionalDocs: {
      docType: string;
      fileUrl: string;
      uploadedAt: Date;
    }[];
    verificationStatus: boolean;
    verifiedAt: Date | null;
  };

  @Prop({
    type: [{ type: Types.ObjectId, ref: SERVICE_OFFERED_MODEL_NAME }],
    default: [],
  })
  servicesOffered: (Types.ObjectId | ServiceDocument)[];

  @Prop({ type: [String] })
  schedules: string[];

  @Prop({ default: null })
  subscriptionID: string;

  @Prop()
  profession: string;

  @Prop()
  experience: number;

  @Prop()
  serviceRadius: number;

  @Prop({
    type: {
      day: {
        from: { type: String },
        to: { type: String },
      },
      time: {
        from: { type: String },
        to: { type: String },
      },
    },
  })
  availability: {
    day: { from: string; to: string };
    time: { from: string; to: string };
  };
}

export const ProviderSchema = SchemaFactory.createForClass(ProviderDocument);
