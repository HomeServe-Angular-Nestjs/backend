import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SERVICE_OFFERED_MODEL_NAME } from '../constants/model.constant';
import { IDoc, IExpertise, ILanguage, VerificationStatusType } from '../entities/interfaces/user.entity.interface';
import { BaseUserDocument } from './base/user-base.schema';
import { ServiceDocument } from './service.schema';

@Schema({ timestamps: true })
export class ProviderDocument extends BaseUserDocument {
  @Prop()
  bio: string;

  @Prop({
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  })
  verificationStatus: VerificationStatusType

  @Prop({
    type: [
      {
        specialization: { type: String },
        label: { type: String },
      },
    ],
  })
  expertise: IExpertise[]

  @Prop({ type: [String] })
  additionalSkills: string[];

  @Prop({
    type: [
      {
        language: String,
        proficiency: String
      }
    ],
  })
  languages: ILanguage[];

  @Prop({ type: [String] })
  workImages: string[];

  @Prop({ type: [String] })
  awards: string[];

  @Prop({ default: false })
  isCertified: boolean;

  @Prop({
    type: [
      {
        label: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date },
        verificationStatus: {
          type: String,
          enum: ['pending', 'verified', 'rejected'],
          default: 'pending'
        },
        verifiedAt: { type: Date },
        isDeleted: { type: Boolean, default: false }
      }
    ]
  })
  docs: IDoc[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: SERVICE_OFFERED_MODEL_NAME }],
    default: [],
  })
  servicesOffered: (Types.ObjectId | ServiceDocument)[];

  @Prop({ type: [String] })
  schedules: string[];

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
    _id: false
  })
  availability: {
    day: { from: string; to: string };
    time: { from: string; to: string };
  };

  @Prop({ type: [{ from: String, to: String, _id: false }], default: [] })
  defaultSlots: {
    from: string;
    to: string;
  }[];

  @Prop({ default: null })
  bookingLimit: number;

  @Prop({ default: null })
  bufferTime: number;

  @Prop({ default: false })
  enableSR: boolean
}

export const ProviderSchema = SchemaFactory.createForClass(ProviderDocument);
ProviderSchema.index({ location: '2dsphere' });