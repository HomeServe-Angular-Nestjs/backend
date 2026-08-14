import type { BookingStatus } from '@core/enum/bookings.enum';
import type { IEntity } from '../base/interfaces/base-entity.entity.interface';
import type { IPagination } from './booking.entity.interface';

export interface IAdmin extends IEntity {
  email: string;
  password: string;
  fullname?: string;
  type: 'admin';
  isActive: boolean;
}

export interface IUserData {
  id: string;
  username: string;
  email: string;
  contact: string;
  createdAt: Date;
  isActive: boolean;
  isDeleted: boolean;
}

export interface IUserDataWithPagination {
  data: IUserData[];
  pagination: IPagination;
}

export interface IAdminDashboardOverview {
  totalProviders: number;
  totalCustomers: number;
  totalUsers: number;
  activeProviders: number;
  pendingVerifications: number;
  todaysBookings: number;
  newUsersThisWeek: number;
  weeklyTransactions: number;
}

export interface IAdminDashboardRevenue {
  amount: number;
  date: string;
}

export interface IAdminDashboardSubscription {
  monthlyPremium: number;
  yearlyPremium: number;
  totalProviders: number;
}

export interface IStats {
  new: number;
  total: number;
  active: number;
}

export interface IAdminDashboardUserStats {
  customer: IStats;
  provider: IStats;
}

export type ReportCategoryType = 'booking' | 'users' | 'transactions' | 'subscription';

export interface IBookingReportData {
  bookingId: string;
  customerEmail: string;
  providerEmail: string;
  totalAmount: number | string;
  date: string | Date;
  phone: string | number;
  bookingStatus: string;
  paymentStatus: string;
  transactionId: string;
}

export interface IBookingMatrixData {
  totalBookings: number | string;
  totalSpend: number | string;
  totalRefunded: number | string;
  averageSpend: number | string;
  pending: number | string;
  confirmed: number | string;
  cancelled: number | string;
}

interface IReportDownloadData {
  fromDate: Date | string;
  toDate: Date | string;
}

export interface IReportDownloadBookingData extends IReportDownloadData {
  userId: string;
  status: BookingStatus;
}

export interface IReportDownloadUserData extends IReportDownloadData {
  status: 'active' | 'blocked';
  role: 'provider' | 'customer';
}

export interface IReportDownloadTransactionData extends IReportDownloadData {
  method: string;
  transactionType: string;
}

export interface IReportUserData {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  username: string;
  createdAt: string;
  status: string;
}

export interface IReportCustomerMatrix {
  totalBookings: number | string;
  totalSpend: number | string;
  totalRefunded: number | string;
}

export interface IReportCustomerData extends IReportUserData, IReportCustomerMatrix {}

export interface IReportProviderData extends IReportUserData, IReportProviderMatrix {
  profession: string;
  experience: string;
  isCertified: boolean;
  avgRating: number | string;
  totalServiceListed: number | string;
  totalReviews: number | string;
}

export interface IReportProviderMatrix {
  totalBookings: number | string;
  totalEarnings: number | string;
  totalRefunds: number | string;
}

export interface IReportTransactionData {
  id: string;
  userId: string;
  email: string;
  amount: string | number;
  method: string;
  contact: string;
  transactionType: string;
  date: string | Date;
}

export interface IAdminReviewStats {
  totalReviews: number;
  activeReviews: number;
  inactiveReviews: number;
  reportedReviews: number;
  averageRating: number;
  distribution: IReviewDistribution[];
}

export interface IReviewDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface ILowestRatedProvider {
  providerId: string;
  providerName: string;
  providerAvatar: string;
  avgRating: number;
  totalReviews: number;
}

export interface IRatingTrendPoint {
  date: string;
  avgRating: number;
  count: number;
}

// ----------------- Sales Report (BI dashboard) -----------------

export interface ISalesReportFilter {
  fromDate?: string | Date;
  toDate?: string | Date;
  professionId?: string;
  categoryId?: string;
  providerId?: string;
  bookingStatus?: string;
}

export interface ISalesSummary {
  totalBookings: number;
  totalSales: number;
  completedSales: number;
  cancelledSales: number;
  avgOrderValue: number;
  avgDailySales: number;
  salesGrowthPct: number;
}

export interface ISalesTrendPoint {
  label: string;
  revenue: number;
  bookings: number;
}

export interface IBookingsSoldBuckets {
  today: number;
  week: number;
  month: number;
  year: number;
}

export interface INamedMetric {
  name: string;
  bookings: number;
  revenue: number;
}

export interface ITopSellingService {
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  profession: string;
  bookings: number;
  revenue: number;
  avgRating: number;
}

export interface IProviderPerformance {
  providerId: string;
  providerName: string;
  completedJobs: number;
  cancelled: number;
  revenue: number;
  completionRate: number;
  avgRating: number;
}

export interface ISalesDistributionPoint {
  name: string;
  value: number;
}

export interface ICancellationAnalysis {
  cancelledOrders: number;
  cancellationRate: number;
  topCancelledCategories: { name: string; bookings: number }[];
  topCancelledProviders: { name: string; bookings: number }[];
}

export interface ISalesFilterOptions {
  professions: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  providers: { id: string; name: string }[];
}

export interface ISalesReportBundle {
  summary: ISalesSummary;
  trend: ISalesTrendPoint[];
  bookingsSold: IBookingsSoldBuckets;
  professions: INamedMetric[];
  categories: INamedMetric[];
  services: ITopSellingService[];
  providers: IProviderPerformance[];
  distribution: ISalesDistributionPoint[];
  cancellation: ICancellationAnalysis;
  filters: ISalesFilterOptions;
}
