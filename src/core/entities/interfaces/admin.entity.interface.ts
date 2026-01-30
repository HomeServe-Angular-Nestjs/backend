import { BookingStatus } from '@core/enum/bookings.enum';
import { IEntity } from '../base/interfaces/base-entity.entity.interface';
import { IPagination } from './booking.entity.interface';

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
  isDeleted: boolean
}

export interface IUserDataWithPagination {
  data: IUserData[],
  pagination: IPagination
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

export interface IReportCustomerData extends IReportUserData, IReportCustomerMatrix { }


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
  reportedReviews: number;
  averageRating: number;
}
