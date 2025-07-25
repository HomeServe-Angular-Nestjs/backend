import { SlotType } from '../../../modules/bookings/dtos/booking.dto';
import { IBaseUserEntity } from '../base/interfaces/base-user.entity.interface';
import { IAdmin } from './admin.entity.interface';
import { IPagination } from './booking.entity.interface';

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

export interface ILocation {
  type: 'Point',
  coordinates: [number, number];
}

export interface ICustomer extends IBaseUserEntity {
  savedProviders?: string[] | null;
  isReviewed: boolean;
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

export interface IReview {
  id?: string;
  reviewedBy: string;
  desc: string;
  writtenAt: Date;
  isReported: boolean;
  rating: number;
  isActive: boolean;
}

export type VerificationStatusType = 'pending' | 'verified' | 'rejected';

export interface IProvider extends IBaseUserEntity {
  verificationStatus: VerificationStatusType;
  bio: string;
  expertise: IExpertise[];
  additionalSkills: string[];
  languages: ILanguage[];
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
  ratingCount: number;
  avgRating: number;
  reviews: IReview[];
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

export interface IFetchReviews {
  avatar: string;
  name: string;
  avgRating: number;
  writtenAt: Date;
  desc: string;
}

export interface IReviewCustomerInfo {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
}

export interface IAdminReviewData {
  reviewId: string;
  reviewedBy: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerAvatar: string;
  };
  providerId: string;
  providerName: string;
  providerEmail: string;
  providerAvatar: string;
  isReported: boolean;
  desc: string;
  rating: number;
  writtenAt: Date;
  isActive: boolean;
}

export interface PaginatedReviewResponse {
  reviews: IAdminReviewData[];
  pagination: IPagination
}

export type SortByRatingType = 'latest' | 'oldest' | 'highest' | 'lowest';
export type SearchByReviewType = 'review id' | 'customer' | 'provider' | 'content';

export interface IReviewFilters {
  minRating?: string;
  sortBy?: SortByRatingType;
  search?: string;
  searchBy?: SearchByReviewType;
  page?: number;
}

export interface ITopProviders {
  totalEarnings: number;
  providerId: string;
  username: string;
  email: string;
}