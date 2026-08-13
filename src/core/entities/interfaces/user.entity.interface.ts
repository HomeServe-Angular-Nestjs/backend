import { RatingSearchBy, RatingsSortBy } from '@core/enum/ratings.enum';
import { AvailabilityEnum } from '@core/enum/slot.enum';

import { SlotType } from '../../../modules/bookings/dtos/booking.dto';
import { IBaseUserEntity } from '../base/interfaces/base-user.entity.interface';
import { IAdmin } from './admin.entity.interface';
import { IDisputeAnalytics } from './report.entity.interface';
import { IBookingsBreakdown, INewOrReturningClientData, IPagination, IRatingDistribution, IRecentReviews, IRevenueBreakdown, IRevenueCompositionData, IRevenueMonthlyGrowthRateData, IRevenueTrendData, IReview, ISlot, ITopServicesByRevenue, IUpcomingBooking } from './booking.entity.interface';
import { IBookingOverview } from './admin-user-details.entity.interface';

export type UserType = 'customer' | 'provider' | 'admin';
export type ClientUserType = Exclude<UserType, 'admin'>;
export type VerificationStatusType = 'pending' | 'verified' | 'rejected';
export type IUser = ICustomer | IProvider | IAdmin;
export type SortByRatingType = RatingsSortBy;
export type SearchByReviewType = RatingSearchBy;

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

export interface IUpdateProfileData {
  fullname?: string;
  username?: string;
  phone?: string;
  address?: string;
  coordinates?: [number, number];
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
  serviceRadius: number | null;
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

export interface ICustomerProviderDetails extends IProvider {
  avgRating: number;
  totalReviews: number;
  isSaved: boolean;
  successRate: number;
  jobsCompleted: number;
}

export interface IFilterFetchProviders {
  search?: string;
  address?: string;
  status?: FilterStatusType;
  lng: number | null;
  lat: number | null;
  availability?: AvailabilityEnum | 'all';
  providerIds?: string[];
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
  status?: boolean | 'all';
  isReported?: boolean | 'all';
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
  nextCursor: string | null;
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

// ----------- Analytics Resource Bundles ------------

export interface IPerformanceAnalyticsBundle {
  summary: { performanceAnalytics: IProviderPerformanceOverview };
  bookings: {
    bookingOverview: IBookingPerformanceData[];
    trends: IReviewChartData;
  };
  quality: {
    responseTimeDistribution: IResponseTimeChartData[];
    onTimeArrival: IOnTimeArrivalChartData[];
    monthlyDisputeStats: IDisputeAnalytics[];
  };
  comparison: {
    comparisonOverview: IComparisonOverviewData;
    comparisonStats: IComparisonChartData[];
  };
}

export interface IRevenueAnalyticsBundle {
  summary: { revenueOverview: IProviderRevenueOverview };
  trends: { trend: IRevenueTrendData };
  growth: {
    monthlyGrowth: IRevenueMonthlyGrowthRateData[];
    composition: IRevenueCompositionData[];
    topServices: ITopServicesByRevenue[];
  };
  clients: { newAndReturning: INewOrReturningClientData[] };
}

export interface IProviderDashboardOverview {
  revenue: IRevenueBreakdown;
  bookings: IBookingsBreakdown;
  avgRating: number;
  completionRate: number;
  workingHours: Availability | null;
  nextAvailableSlot: ISlot & { date: Date | string } | null;
  activeServiceCount: number;
  nextBooking: IUpcomingBooking | null;
  upcomingBookingCount: number;
  recentBookings: IBookingOverview[];
  wallet: {
    balance: number;
  } | null;
}