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

export interface IAddress {
  type: 'Point',
  address: string,
  coordinates: [number, number];
}

export interface ICustomer extends IBaseUserEntity {
  location?: IAddress;
  savedProviders?: string[] | null;
}

export interface IExpertise {
  specialization: string;
  label: string;
};

export interface ILanguage {
  language: string;
  proficiency: string;
}

export interface IDoc {
  id: string;
  label: string;
  fileUrl: string;
  uploadedAt: Date;
  verificationStatus: VerificationStatusType;
  verifiedAt?: Date;
  isDeleted: boolean
};

export type VerificationStatusType = 'pending' | 'verified' | 'rejected';

export interface IProvider extends IBaseUserEntity {
  verificationStatus: VerificationStatusType;
  bio: string;
  expertise: IExpertise[];
  additionalSkills: string[];
  languages: ILanguage[];
  location?: IAddress;
  workImages: string[];
  awards: string[];
  isCertified: boolean;
  docs: IDoc[];
  servicesOffered: string[];
  schedules: string[];
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

export interface ISearchedProviders {
  id: string;
  avatar: string;
  name: string;
  address: string;
}

export interface IVerificationStatusMetrics {
  count: number;
  percentage: string;
}

export interface IApprovalOverviewData {
  pending: IVerificationStatusMetrics;
  verified: IVerificationStatusMetrics;
  rejected: IVerificationStatusMetrics;
}

export interface IApprovalTableDetails {
  id: string;
  avatar: string;
  name: string;
  email: string;
  documentCount: number;
  date: Date;
  verificationStatus: VerificationStatusType
} 