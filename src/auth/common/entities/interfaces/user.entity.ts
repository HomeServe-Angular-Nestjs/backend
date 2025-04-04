import { IBaseUserEntity } from "./base/base-user.entity.interface";

export interface ICustomer extends IBaseUserEntity {
    locations?: {
        lat: number,
        lng: number
    }[] | null;
    savedProviders?: string[] | null;
}


export interface IProvider extends IBaseUserEntity {
    isVerified: boolean;
    bio: string;
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
}

export type IUser = ICustomer | IProvider;