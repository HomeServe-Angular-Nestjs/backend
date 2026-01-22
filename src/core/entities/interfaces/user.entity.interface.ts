import { AvailabilityEnum } from '@core/enum/slot.enum';
import { SlotType } from '../../../modules/bookings/dtos/booking.dto';
import { IBaseUserEntity } from '../base/interfaces/base-user.entity.interface';
import { IAdmin } from './admin.entity.interface';
import { IBookingsBreakdown, IPagination, IRatingDistribution, IRecentReviews, IRevenueBreakdown, IReview } from './booking.entity.interface';

export type UserType = 'customer' | 'provider' | 'admin';
export type ClientUserType = Exclude<UserType, 'admin'>;
export type VerificationStatusType = 'pending' | 'verified' | 'rejected';
export type IUser = ICustomer | IProvider | IAdmin;
export type SortByRatingType = 'latest' | 'oldest' | 'highest' | 'lowest';
export type SearchByReviewType = 'review id' | 'customer' | 'provider' | 'content';
export type FilterStatusType = 'nearest' | 'best-rated' | 'all';


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
  subscriptionId: string | null;
  availability: Availability;
  profession: string;
  experience: number;
  serviceRadius: number;
  bookingLimit: number | null;
  bufferTime: number | null;
  enableSR: boolean;
}

export interface ISearchedProviders {
  id: string;
  avatar: string;
  name: string;
  address: string;
}

export interface IFilterFetchProviders {
  search?: string;
  status?: FilterStatusType;
  lng: number | null;
  lat: number | null;
  availability?: AvailabilityEnum | 'all';
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

export interface IProviderCardView {
  id: string;
  fullname: string;
  username: string;
  isCertified: boolean;
  avgRating: number;
  totalReviews: number;
  experience: number;
  profession: string;
  address: string;
  isActive: boolean;
  avatar: string;
}

export interface IProviderCardWithPagination {
  providerCards: IProviderCardView[];
  pagination: IPagination;
}

export interface ITotalReviewAndAvgRating {
  providerId: string;
  avgRating: number;
  totalReviews: number;
}

interface IDisplayReviewItem extends IReview {
  name: string;
  avatar: string;
  email: string;
}

export interface IDisplayReviews {
  reviews: IDisplayReviewItem[];
  avgRating: number;
  totalReviews: number;
  allFetched: boolean;
}

// ----------- Performance Analytics Models ------------

export interface IProviderPerformanceOverview {
  avgResponseTime: number;
  onTimePercent: number;
  avgRating: number;
  completionRate: number;
}

export interface IBookingPerformanceData {
  month: string;
  completed: number;
  cancelled: number;
  total: number;
}

export interface IReviewChartData {
  distributions: IRatingDistribution[];
  reviews: IRecentReviews[];
}

export interface IResponseTimeChartData {
  name: string;
  count: number;
}

export interface IOnTimeArrivalChartData {
  month: string;
  monthNumber?: number;
  percentage: number;
}

export interface IComparisonOverviewData {
  growthRate: number;
  monthlyTrend: {
    previousMonth: number;
    currentMonth: number;
    previousRevenue: number;
    currentRevenue: number;
    growthPercentage: number;
  };
  providerRank: number;
}

export interface IComparisonChartData {
  month: string | number;
  performance: number;
  platformAvg: number;
}

export interface IProviderRevenueOverview {
  totalRevenue: number;
  revenueGrowth: number;
  completedTransactions: number;
  avgTransactionValue: number;
}

export interface IProviderDashboardOverview {
  revenue: IRevenueBreakdown;
  bookings: IBookingsBreakdown;
  avgRating: number;
  completionRate: number;
  availability: Availability | null;
  nextAvailableSlot: { from: string | Date, to: String | Date } | null;
  activeServiceCount: number;
}