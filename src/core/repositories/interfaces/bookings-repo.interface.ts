import { FilterQuery, Types } from 'mongoose';
import { IBookingStats, IRatingDistribution, IRevenueMonthlyGrowthRateData, IRevenueTrendRawData, RevenueChartView, IRevenueCompositionData, ITopServicesByRevenue, INewOrReturningClientData, IAreaSummary, IServiceDemandData, ILocationRevenue, ITopAreaRevenue, IUnderperformingArea, IPeakServiceTime, IRevenueBreakdown, IBookingsBreakdown, IReviewDetailsRaw, IReviewFilter, IAdminBookingFilter, IAdminBookingList } from '@core/entities/interfaces/booking.entity.interface';
import { IBookingPerformanceData, IComparisonChartData, IComparisonOverviewData, IOnTimeArrivalChartData, IProviderRevenueOverview, IResponseTimeChartData, ITopProviders, ITotalReviewAndAvgRating } from '@core/entities/interfaces/user.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { BookingDocument, SlotDocument } from '@core/schema/bookings.schema';
import { IBookingReportData, IReportCustomerMatrix, IReportDownloadBookingData, IReportProviderMatrix } from '@core/entities/interfaces/admin.entity.interface';
import { SlotStatusEnum } from '@core/enum/slot.enum';
import { BookingStatus, CancelStatus, PaymentStatus } from '@core/enum/bookings.enum';

export interface IBookingRepository extends IBaseRepository<BookingDocument> {
    findBookingsByCustomerIdWithPagination(customerId: string | Types.ObjectId, skip: number, limit: number): Promise<BookingDocument[]>;
    findBookingsByProviderId(providerId: string | Types.ObjectId): Promise<BookingDocument[]>;
    fetchFilteredBookingsWithPagination(filter: IAdminBookingFilter, option?: { page: number; limit: number }): Promise<IAdminBookingList[]>;
    findPaidBookings(bookingId: string): Promise<BookingDocument | null>;
    count(filter?: FilterQuery<BookingDocument>): Promise<number>;
    countDocumentsByCustomer(customerId: string | Types.ObjectId): Promise<number>;
    bookingStatus(): Promise<IBookingStats | null>;
    getTopProviders(): Promise<ITopProviders[]>;
    generateBookingReport(data: Partial<IReportDownloadBookingData>): Promise<IBookingReportData[]>;
    getCustomerReportMatrix(id: string): Promise<IReportCustomerMatrix>;
    getProviderReportMatrix(id: string): Promise<IReportProviderMatrix>;
    findSlotsByDate(date: Date): Promise<SlotDocument[]>;
    findBookedSlots(ruleId: string): Promise<SlotDocument[]>;
    isAlreadyBooked(ruleId: string, from: string, to: string, dateISO: string): Promise<boolean>;
    updateBookingStatus(bookingId: string, newStatus: BookingStatus): Promise<BookingDocument | null>;
    updateSlotStatus(ruleId: string, from: string, to: string, dateISO: string, status: SlotStatusEnum): Promise<boolean>;
    markBookingCancelledByCustomer(customerId: string, bookingId: string, reason: string, cancelStatus: CancelStatus, bookingStatus: BookingStatus): Promise<BookingDocument | null>;
    updatePaymentStatus(bookingId: string, status: PaymentStatus): Promise<BookingDocument | null>;
    markBookingCancelledByProvider(providerId: string, bookingId: string, bookingStatus: BookingStatus, cancelStatus: CancelStatus, reason?: string): Promise<BookingDocument | null>;
    addReview(bookingId: string, desc: string, rating: number): Promise<boolean>;
    getAvgRating(providerId: string): Promise<number>;
    getReviews(providerId: string, filter: IReviewFilter, options?: { page?: number, limit?: number }): Promise<IReviewDetailsRaw[]>;
    countReviews(providerId: string): Promise<number>;
    isAlreadyRequestedForCancellation(bookingId: string): Promise<boolean>;

    getPerformanceSummary(providerId: string): Promise<any>;
    getAvgRatingAndTotalReviews(providerId?: string): Promise<ITotalReviewAndAvgRating[]>;
    getBookingPerformanceData(providerId: string): Promise<IBookingPerformanceData[]>;
    getRatingDistributionsByProviderId(providerId: string): Promise<IRatingDistribution[]>;
    getRecentReviews(providerId: string, limit?: number): Promise<BookingDocument[]>;
    getResponseDistributionTime(providerId: string): Promise<IResponseTimeChartData[]>
    getOnTimeArrivalData(providerId: string): Promise<IOnTimeArrivalChartData[]>;
    getComparisonOverviewData(providerId: string): Promise<IComparisonOverviewData>;
    getComparisonData(providerId: string): Promise<IComparisonChartData[]>;

    getRevenueOverview(providerId: string): Promise<IProviderRevenueOverview>;
    getRevenueTrendOverTime(providerId: string, view: RevenueChartView): Promise<IRevenueTrendRawData>;
    getRevenueGrowthByMonth(providerId: string): Promise<IRevenueMonthlyGrowthRateData[]>;
    getRevenueCompositionByServiceCategory(providerId: string): Promise<IRevenueCompositionData[]>;
    getTopTenServicesByRevenue(providerId: string): Promise<ITopServicesByRevenue[]>;
    getNewAndReturningClientData(providerId: string): Promise<INewOrReturningClientData[]>;

    getAreaSummaryData(providerId: string): Promise<IAreaSummary>;
    getServiceDemandData(providerId: string): Promise<IServiceDemandData[]>;
    getServiceDemandByLocation(providerId: string): Promise<ILocationRevenue[]>;
    getTopAreasRevenue(providerId: string): Promise<ITopAreaRevenue[]>;
    getUnderperformingAreas(providerId: string): Promise<IUnderperformingArea[]>;
    getPeakServiceTime(providerId: string): Promise<IPeakServiceTime[]>;

    getRevenueBreakdown(providerId: string): Promise<IRevenueBreakdown>;
    getBookingsBreakdown(providerId: string): Promise<IBookingsBreakdown>;
    getBookingsCompletionRate(providerId: string): Promise<number>;
} 
