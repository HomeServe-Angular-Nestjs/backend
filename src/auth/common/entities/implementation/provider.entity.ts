import { IProvider } from "../interfaces/user.entity";
import { BaseUserEntity } from "./base/base-user.entity";

export class Provider extends BaseUserEntity implements IProvider {
    bio: string;
    isVerified: boolean;
    expertise: {
        specialization: string;
        label: string;
        tag: string;
    }[] | null;
    additionalSkills: string[] | null;
    languages: string[] | null;
    location: {
        street: string;
        city: string;
        state: string;
        zipcode: string;
        coordinates: {
            lat: number;
            lng: number;
        }
    };
    workImages: string[] | null;
    awards: string[] | null;
    isCertified: boolean;
    verification: {
        pcc: {
            fileUrl: string;
            uploadedAt: Date;
        },
        additionalDocs: {
            type: string;
            fileUrl: string;
            uploadedAt: Date;
        }[] | null;
        verificationStatus: boolean;
        verifiedAt: Date;
    };
    schedules: string[] | null;
    subscriptionID: string | null;

    constructor(partial: Partial<Provider>) {
        super(partial);
        Object.assign(this, partial);
    }
}