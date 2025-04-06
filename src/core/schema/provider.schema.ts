import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseUserDocument } from './base/user-base.schema';

@Schema()
export class ProviderDocument extends BaseUserDocument {
    @Prop()
    bio: string;

    @Prop({
        type: [{
            specialization: { type: String },
            label: { type: String },
            tag: { type: String }
        }]
    })
    Expertise: {
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
                lng: Number
            }
        },
        index: true
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

    @Prop()
    isCertified: boolean;

    @Prop({
        type: {
            pcc: {
                fileUrl: String,
                uploadedAt: Date
            },
            additionalDocs: [{
                type: { type: String },
                fileUrl: String,
                uploadedAt: Date
            }],
            verificationStatus: String,
            verifiedAt: Date
        }
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

    @Prop({ type: [String] })
    schedules: string[];

    @Prop()
    subscriptionID: string;
}

export const ProviderSchema = SchemaFactory.createForClass(ProviderDocument);
