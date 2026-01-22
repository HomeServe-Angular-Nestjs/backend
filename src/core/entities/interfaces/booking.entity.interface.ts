import { ITransaction } from '@core/entities/interfaces/transaction.entity.interface';
import { BookingStatus, CancelStatus, PaymentStatus } from '../../enum/bookings.enum';
import { IEntity } from '../base/interfaces/base-entity.entity.interface';
import { SlotStatusEnum } from '@core/enum/slot.enum';
import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '@core/enum/transaction.enum';
import { ServiceDocument } from '@core/schema/service.schema';
import { ClientUserType } from '@core/entities/interfaces/user.entity.interface';

export type RevenueChartView = 'monthly' | 'quarterly' | 'yearly';


export interface IBookingResponse {
    bookingId: string;
    provider: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    services: string[];
    expectedArrivalTime: Date | string;
    bookingStatus: BookingStatus;
    paymentStatus: PaymentStatus;
    cancelStatus: CancelStatus | null;
    totalAmount: number;
    createdAt: Date;
    transaction: {
        transactionId: string,
        paymentSource: PaymentSource
    } | null;
    review: IReview | null;
}

export interface IPagination {
    total: number;
    page: number;
    limit: number
}


export interface IBookingWithPagination {
    bookingData: IBookingResponse[];
    paginationData: IPagination;
}

export interface IProviderBookingLists {
    services: IProviderBookingListService[];
    customer: {
        id: string;
        name: string;
        avatar: string;
        email: string;
    },
    bookingId: string;
    expectedArrivalTime: Date;
    totalAmount: number;
    createdAt: Date;
    paymentStatus: PaymentStatus;
    cancelStatus: CancelStatus | null;
    bookingStatus: BookingStatus;
}

export interface IProviderBookingListService {
    id: string;
    title: string;
    image: string;
}

export interface IPagination {
    page: number;
    limit: number;
    total: number;
}


export interface IResponseProviderBookingLists {
    bookingData: IProviderBookingLists[];
    paginationData: IPagination;
}

export interface IBookedSlot extends ISlot {
    date: Date;
    status: SlotStatusEnum;
}

export interface IReview {
    desc: string;
    rating: number;
    writtenAt: Date | string;
    isActive: boolean;
    isReported: boolean;
}

export interface IBooking extends IEntity {
    customerId: string;
    providerId: string;
    totalAmount: number;
    expectedArrivalTime: Date;
    actualArrivalTime: Date | null;
    bookingStatus: BookingStatus;
    cancellationReason: string | null;
    cancelStatus: CancelStatus | null;
    cancelledAt: Date | null;
    location: {
        address: string;
        coordinates: [number, number];
    };
    slot: IBookedSlot;
    services: string[];
    transactionHistory: ITransaction[];
    paymentStatus: PaymentStatus;
    review: IReview | null;
    respondedAt: Date | null;
}

export interface ISlot {
    from: string;
    to: string;
}

export interface IBookingOverviewChanges {
    totalBookingsChange: number;
    pendingRequestsChange: number;
    completedJobsChange: number;
    pendingPaymentsChange: number;
    cancelledBookingsChange: number;
}

export interface IBookingOverviewData {
    pendingRequests: number;
    completedJobs: number;
    pendingPayments: number;
    cancelledBookings: number;
    totalBookings: number;
    changes?: IBookingOverviewChanges;
}

export interface IBookingDetailsBase {
    bookingId: string;
    bookingStatus: BookingStatus;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    cancelStatus: CancelStatus | null;
    cancelReason: string | null;
    cancelledAt: Date | null;
    expectedArrivalTime: Date;
    actualArrivalTime: Date | null;
    totalAmount: number;
    orderedServices: IBookedService[];
    transaction: {
        id: string;
        paymentDate: Date | string;
        paymentMethod: PaymentSource;
    } | null;
}

export interface IBookedService {
    title: string;
    price: number;
    estimatedTime: number;
}

export interface IBookingDetailCustomer extends IBookingDetailsBase {
    provider: {
        id: string;
        name: string;
        email: string;
        phone: string;
        location: string;
    };
    breakup: IPriceBreakupData;
}

export interface IBookingDetailProvider extends IBookingDetailsBase {
    customer: {
        id: string;
        name: string;
        email: string;
        phone: string;
        location: string;
    };
}

export interface IAdminBookingList {
    bookingId: string;
    customer: {
        avatar: string;
        id: string;
        username: string;
        email: string;
    };
    provider: {
        avatar: string;
        id: string;
        username: string;
        email: string;
    };
    date: Date;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
}

export interface IPaginatedBookingsResponse {
    bookingData: IAdminBookingList[];
    pagination: IPagination;
}

export interface IBookingStats {
    total: number;
    completed: number
    pending: number;
    cancelled: number;
    unpaid: number;
    refunded: number;
}

export interface IBookingInvoice {
    invoiceId: string;
    transactionId: string | null;
    transactionType: TransactionType | null;
    paymentStatus: PaymentStatus;
    paymentSource: PaymentSource | null;
    currency: string | null;
    services: IBookedService[];
    userType: 'customer' | 'provider';

    user: {
        name: string;
        email: string;
        contact?: string;
    };

    bookingDetails: {
        status: BookingStatus;
        expectedArrivalTime: string;
        actualArrivalTime?: string | null;
        slot: {
            from: string;
            to: string;
        };
    };

    location: {
        address: string;
        coordinates: [number, number];
    };

    paymentBreakup: {
        providerAmount: number;
        commission: number;
        gst: number;
        total: number;
    };

    paymentDetails: {
        orderId: string;
        paymentId: string;
        receipt: string;
        signature: string;
    } | null;
}

export interface IRatingDistribution {
    rating: string;
    count: number;
}

export interface IRecentReviews {
    name: string;
    desc: string;
    rating: number;
}

export interface IRevenueTrendData {
    providerRevenue: number[];
    platformAvg: number[];
    labels: string[];
}

interface IRevenueTrendPoint {
    label: string;
    totalRevenue: number;
}

export interface IRevenueTrendRawData {
    providerRevenue: IRevenueTrendPoint[];
    platformAvg: IRevenueTrendPoint[];
}

export interface IRevenueMonthlyGrowthRateData {
    totalRevenue: number;
    month: string | number;
    growthRate: number;
}

export interface IRevenueCompositionData {
    totalRevenue: number;
    category: string;
}

export interface ITopServicesByRevenue {
    service: string;
    revenue: number;
    totalBookings: number;
    avgRevenue: number;
}

export interface INewOrReturningClientData {
    month: string;
    newClients: number;
    returningClients: number;
}

export interface IAreaSummary {
    totalBookings: number;
    topPerformingArea: string;
    underperformingArea: string;
    peakBookingHour: string;
}

export interface IServiceDemandData {
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    hour: string;
    count: number;
}

export interface ILocationRevenue {
    locationName: string;
    totalRevenue: number;
    previousRevenue: number;
    changePct: number;
}

export interface ITopAreaRevenue {
    locationName: string;
    totalRevenue: number;
    changePct: number;
}

export interface IUnderperformingArea {
    locationName: string;
    lastMonthRevenue: number;
    currentMonthRevenue: number;
    changePct: number;
}

export interface IPeakServiceTime {
    hour: number;
    weekdayBookings: number;
    weekendBookings: number;
}

export interface IRevenueBreakdown {
    totalEarnings: number;
    completedCount: number;
    pendingCount: number;
}

export interface IBookingsBreakdown {
    totalBookings: number;
    upcomingBookings: number;
    cancelledBookings: number;
    averageBookingValue: number;
}

export interface IReviewDetailsRaw extends IReview {
    id: string;
    avatar: string;
    email: string;
    username: string;
    services: {
        serviceId: string;
        subserviceIds: string[];
    }[];
    serviceDetails: ServiceDocument[];
}

export interface IReviewDetails extends Omit<IReview, 'isActive' | 'isReported'> {
    id: string;
    avatar: string;
    email: string;
    username: string;
    serviceTitles: string[];
}

export interface IReviewWithPagination {
    reviewDetails: IReviewDetails[];
    pagination: IPagination;
}

export interface IReviewFilter {
    search?: string;
    rating?: 'all' | 1 | 2 | 3 | 4 | 5;
    sort?: 'asc' | 'desc';
    time?: 'all' | 'last_6_months' | 'last_year';
}

export interface IAdminBookingDetails {
    bookingId: string;
    totalAmount: number;
    expectedArrival: Date;
    actualArrival: Date | null;
    bookingStatus: BookingStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
    customer: {
        phone: string;
        role: ClientUserType;
        email: string;
    };
    provider: {
        phone: string;
        role: ClientUserType;
        email: string;
    };
    location: {
        address: string;
        coordinates: [number, number];
    };
    transactionHistory: {
        date: string;
        user: ClientUserType;
        type: TransactionType;
        direction: PaymentDirection;
        amount: number;
        status: TransactionStatus;
    }[]
    breakdown: {
        customerPaid: number;
        providerAmount: number;
        commissionEarned: number;
        gst: number;
    }
}

export interface IAdminBookingFilter {
    page?: number;
    search?: string;
    bookingStatus?: BookingStatus | 'all';
    paymentStatus?: PaymentStatus | 'all';
}

export interface IPriceBreakupData {
    subTotal: number;
    tax: number;
    total: number;
}