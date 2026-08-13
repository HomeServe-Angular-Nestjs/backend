import { FilterQuery, Types } from 'mongoose';
import { IBookingStats, IRatingDistribution, IRevenueMonthlyGrowthRateData, IRevenueTrendRawData, RevenueChartView, IRevenueCompositionData, ITopServicesByRevenue, INewOrReturningClientData, IAreaSummary, IServiceDemandData, ILocationRevenue, ITopAreaRevenue, IUnderperformingArea, IPeakServiceTime, IRevenueBreakdown, IBookingsBreakdown, IReviewDetailsRaw, IReviewFilter, IAdminBookingFilter, IAdminBookingList, ISlot, IBookedSlot, IProviderBookingLists, IUpcomingBooking } from '@core/entities/interfaces/booking.entity.interface';
import { IBookingPerformanceData, IComparisonChartData, IComparisonOverviewData, IOnTimeArrivalChartData, IProviderRevenueOverview, IResponseTimeChartData, IReviewFilters, ITopProviders, ITotalReviewAndAvgRating, PaginatedReviewResponse } from '@core/entities/interfaces/user.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { BookingDocument, SlotDocument } from '@core/schema/bookings.schema';
import { IAdminReviewStats, ILowestRatedProvider, IRatingTrendPoint, IBookingReportData, IReportCustomerMatrix, IReportDownloadBookingData, IReportProviderMatrix, ISalesReportBundle, ISalesReportFilter } from '@core/entities/interfaces/admin.entity.interface';
import { IBookingOverview, ICustomerStatistics, IProviderStatistics, IReviewOverview } from '@core/entities/interfaces/admin-user-details.entity.interface';
import { BookingStatus, CancelStatus, PaymentStatus, SortBy } from '@core/enum/bookings.enum';

export interface IBookingRepository extends IBaseRepository<BookingDocument> {
    findBookingsByCustomerIdWithPagination(customerId: string | Types.ObjectId, skip: number, limit: number): Promise<BookingDocument[]>;
    findBookingsByProviderId(providerId: string | Types.ObjectId): Promise<BookingDocument[]>;
    findAllBookingsByProviderId(providerId: string | Types.ObjectId): Promise<BookingDocument[]>;
    findBookingsByProviderIdWithCursor(
        providerId: string | Types.ObjectId,
        cursor: { writtenAt: Date; bookingId: string } | null,
        limit: number
    ): Promise<BookingDocument[]>;
    fetchFilteredBookingsWithPagination(filter: IAdminBookingFilter, option?: { page: number; limit: number }): Promise<IAdminBookingList[]>;
    fetchProviderBookingsWithPagination(
        providerId: string | Types.ObjectId,
        filter: {
            search?: string;
            date?: Date | string;
            sort?: SortBy;
            bookingStatus?: BookingStatus | '';
            paymentStatus?: PaymentStatus | '';
        },
        options: { page: number; limit: number }
    ): Promise<{ data: IProviderBookingLists[]; total: number }>;
    findPaidBookings(bookingId: string): Promise<BookingDocument | null>;
    count(filter?: FilterQuery<BookingDocument>): Promise<number>;
    countDocumentsByCustomer(customerId: string | Types.ObjectId): Promise<number>;
    bookingStatus(): Promise<IBookingStats>;
    getTopProviders(): Promise<ITopProviders[]>;
    generateBookingReport(data: Partial<IReportDownloadBookingData>): Promise<IBookingReportData[]>;
    getCustomerReportMatrix(id: string): Promise<IReportCustomerMatrix>;
    getProviderReportMatrix(id: string): Promise<IReportProviderMatrix>;
    getCustomerStatistics(id: string): Promise<ICustomerStatistics>;
    getProviderStatistics(id: string): Promise<IProviderStatistics>;
    getRecentBookingsByCustomer(customerId: string, limit?: number): Promise<IBookingOverview[]>;
    getRecentBookingsByProvider(providerId: string, limit?: number): Promise<IBookingOverview[]>;
    getUpcomingBookings(providerId: string, limit?: number): Promise<IUpcomingBooking[]>;
    getRecentReviewsByCustomer(customerId: string, limit?: number): Promise<IReviewOverview[]>;
    getRecentReviewsByProvider(providerId: string, limit?: number): Promise<IReviewOverview[]>;
    getServiceBookingCounts(providerId: string): Promise<{ serviceId: string; count: number }[]>;
    findSlotsByDate(date: Date): Promise<SlotDocument[]>;
    findBookedSlots(ruleId: string): Promise<SlotDocument[]>; //todo-today
    isAlreadyBooked(ruleId: string, from: string, to: string, dateISO: string): Promise<boolean>;//todo-today
    updateBookingStatus(bookingId: string, newStatus: BookingStatus): Promise<BookingDocument | null>;
    markBookingCancelledByCustomer(customerId: string, bookingId: string, reason: string, cancelStatus: CancelStatus, bookingStatus: BookingStatus): Promise<BookingDocument | null>;
    updatePaymentStatus(bookingId: string, status: PaymentStatus): Promise<BookingDocument | null>;
    markBookingCancelledByProvider(providerId: string, bookingId: string, bookingStatus: BookingStatus, cancelStatus: CancelStatus, reason?: string): Promise<BookingDocument | null>;
    addReview(bookingId: string, desc: string, rating: number): Promise<boolean>;
    getAvgRating(providerId: string): Promise<number>;
    getReviews(providerId: string, filter: IReviewFilter, options?: { page?: number, limit?: number }): Promise<IReviewDetailsRaw[]>;
    countReviews(providerId: string): Promise<number>;
    isAlreadyRequestedForCancellation(bookingId: string): Promise<boolean>;
    isAnyBookingOngoing(customerId: string, providerId: string): Promise<boolean>;
    fetchBookingsByProviderOnSameDate(customerId: string, providerId: string, date: Date | string): Promise<BookingDocument[]>;
    findAllBookingsByProviderOnSameDate(providerId: string, date: Date | string): Promise<BookingDocument[]>;

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
    completedBookingsCount(providerId: string): Promise<number>;
    getNextAvailableSlot(providerId: string): Promise<ISlot & { date: Date }>;
    getAdminReviews(filter: IReviewFilters): Promise<PaginatedReviewResponse>;
    getAdminReviewStats(): Promise<IAdminReviewStats>;
    getLowestRatedProviders(limit: number): Promise<ILowestRatedProvider[]>;
    getRatingTrend(days: number): Promise<IRatingTrendPoint[]>;
    updateReviewStatus(reviewId: string, status: boolean): Promise<boolean>;
    markReviewReported(reviewId: string): Promise<boolean>;
    rescheduleBooking(bookingId: string, newExpectedArrivalTime:Date, newSlot: IBookedSlot): Promise<BookingDocument | null>;
    aggregateSalesReport(filter: ISalesReportFilter): Promise<ISalesReportBundle>;
}


