import { IAdmin } from './admin.entity.interface';
import { IBaseUserEntity } from '../base/interfaces/base-user.entity.interface';

export type Availability = {
  day: {
    from: string,
    to: string,
  },
  time: {
    from: string,
    to: string
  }
}

export interface ICustomer extends IBaseUserEntity {
  locations?:
  | {
    lat: number;
    lng: number;
  }[]
  | null;
  savedProviders?: string[] | null;
}

export interface IProvider extends IBaseUserEntity {
  isVerified: boolean;
  bio: string;
  expertise:
  | {
    specialization: string;
    label: string;
    tag: string;
  }[]
  | null;
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
    };
  };
  workImages: string[] | null;
  awards: string[] | null;
  isCertified: boolean;
  verification: {
    pcc: {
      fileUrl: string;
      uploadedAt: Date;
    };
    additionalDocs:
    | {
      type: string;
      fileUrl: string;
      uploadedAt: Date;
    }[]
    | null;
    verificationStatus: boolean;
    verifiedAt: Date;
  };
  schedules: string[] | null;
  subscriptionID: string | null;
  profession: string;
  experience: number;
  serviceRadius: number;
  availability: Availability;
}

export type IUser = ICustomer | IProvider | IAdmin;
