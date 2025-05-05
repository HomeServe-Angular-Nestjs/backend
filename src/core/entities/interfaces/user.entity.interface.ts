import { IAdmin } from './admin.entity.interface';
import { IBaseUserEntity } from '../base/interfaces/base-user.entity.interface';
import { SlotType } from './schedule.entity.interface';

export type Availability = {
  day: {
    from: string;
    to: string;
  };
  time: {
    from: string;
    to: string;
  };
};

export type Address = {
  type: 'Point',
  address: string,
  coordinates: [number, number];
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
  location?: Address;
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
  servicesOffered: string[];
  schedules: string[] | null;
  defaultSlots: SlotType[];
  subscriptionID: string | null;
  availability: Availability;
  profession: string;
  experience: number;
  serviceRadius: number;
  bookingLimit: number | null;
  bufferTime: number | null;
  enableSR: boolean;
}

export type IUser = ICustomer | IProvider | IAdmin;
