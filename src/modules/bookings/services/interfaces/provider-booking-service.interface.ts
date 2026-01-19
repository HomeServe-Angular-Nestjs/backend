import { IBookingDetailProvider, IBookingOverviewData, IResponseProviderBookingLists, IReviewWithPagination } from '@core/entities/interfaces/booking.entity.interface';
import { ClientUserType, UserType } from '@core/entities/interfaces/user.entity.interface';
import { BookingStatus } from '@core/enum/bookings.enum';
import { IResponse } from '@core/misc/response.util';
import { FilterFields, ReviewFilterDto } from '@modules/bookings/dtos/booking.dto';

export interface IProviderBookingService {
    fetchBookingsList(providerId: string, page: number, bookingFilters: FilterFields): Promise<IResponseProviderBookingLists>;
    fetchOverviewData(providerId: string): Promise<IBookingOverviewData>;
    fetchBookingDetails(bookingId: string): Promise<IBookingDetailProvider>;
    updateBookingStatus(bookingId: string, newStatus: BookingStatus): Promise<IResponse>;
    markBookingCancelledByProvider(providerId: string, bookingId: string, reason?: string): Promise<IResponse<IBookingDetailProvider>>;
    downloadBookingInvoice(bookingId: string, userType: ClientUserType): Promise<Buffer>;
    getReviewData(providerId: string, filters: ReviewFilterDto): Promise<IResponse<IReviewWithPagination>>;
    completeBooking(providerId: string, bookingId: string): Promise<IResponse<IBookingDetailProvider>>;
    canStartVideoCall(providerId: string, customerId: string): Promise<IResponse>;
}