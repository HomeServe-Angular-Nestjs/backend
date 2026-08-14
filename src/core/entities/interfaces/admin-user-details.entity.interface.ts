import type { BookingStatus } from '@core/enum/bookings.enum';
import type { VerificationStatusType } from './user.entity.interface';

export interface ICustomerDetailsProfile {
  id: string;
  username: string;
  fullname: string;
  email: string;
  phone: string;
  avatar: string;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IAddressDetail {
  label: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  coordinates?: [number, number];
  isDefault: boolean;
}

export interface ICustomerStatistics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalAmountSpent: number;
  reviewsWritten: number;
}

export interface IProviderStatistics {
  activeServices: number;
  totalBookings: number;
  completedJobs: number;
  cancelledJobs: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export interface IBookingOverview {
  bookingId: string;
  provider: {
    id: string;
    username: string;
    fullname?: string;
    avatar?: string;
    profession?: string;
  };
  customer: {
    id: string;
    username: string;
    fullname?: string;
    avatar?: string;
  };
  service: {
    name?: string;
    category?: string;
  };
  amount: number;
  status: BookingStatus;
  date: Date | string;
}

export interface IReviewOverview {
  reviewId: string;
  user: {
    id: string;
    username: string;
    fullname?: string;
    avatar?: string;
  };
  rating: number;
  desc: string;
  date: Date | string;
}

export interface IProviderServiceOverview {
  serviceId: string;
  service: string;
  category: string;
  price: number;
  pricingUnit: 'hour' | 'day';
  isActive: boolean;
  totalBookings: number;
}

export interface IDayAvailabilityView {
  day: string;
  isAvailable: boolean;
  timeRanges: {
    startTime: string;
    endTime: string;
  }[];
}

export interface IVacationView {
  isOnVacation: boolean;
  days: {
    date: string;
    reason?: string;
  }[];
}

export interface IAvailabilityOverview {
  days: IDayAvailabilityView[];
  vacation: IVacationView;
}

export interface IDocumentDetail {
  id: string;
  label: string;
  fileUrl: string;
  uploadedAt: Date | string;
}

export interface IProviderDetailsProfile extends ICustomerDetailsProfile {
  profession: string;
  experience: number;
  bio: string;
  verificationStatus: VerificationStatusType;
}

export interface ICustomerDetailsBundle {
  profile: ICustomerDetailsProfile;
  statistics: ICustomerStatistics;
  addresses: IAddressDetail[];
  recentBookings: IBookingOverview[];
  reviews: IReviewOverview[];
}

export interface IProviderDetailsBundle {
  profile: IProviderDetailsProfile;
  statistics: IProviderStatistics;
  services: IProviderServiceOverview[];
  availability: IAvailabilityOverview;
  documents: IDocumentDetail[];
  recentBookings: IBookingOverview[];
  reviews: IReviewOverview[];
}
