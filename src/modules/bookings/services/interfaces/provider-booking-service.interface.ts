import { IBookingDetailProvider, IBookingOverviewData, IResponseProviderBookingLists, IReviewWithPagination } from '@core/entities/interfaces/booking.entity.interface';
import { BookingStatus } from '@core/enum/bookings.enum';
import { IResponse } from '@core/misc/response.util';
import { UserType } from '@modules/auth/dtos/login.dto';
import { FilterFields, ReviewFilterDto } from '@modules/bookings/dtos/booking.dto';

export interface IProviderBookingService {
    fetchBookingsList(id: string, page: number, bookingFilters: FilterFields): Promise<IResponseProviderBookingLists>;
    fetchOverviewData(id: string): Promise<IBookingOverviewData>;
    fetchBookingDetails(bookingId: string): Promise<IBookingDetailProvider>;
    updateBookingStatus(bookingId: string, newStatus: BookingStatus): Promise<IResponse>;
    markBookingCancelledByProvider(bookingId: string, reason?: string): Promise<IResponse<IBookingDetailProvider>>;
    fetchBookedSlots(providerId: string): Promise<IResponse>;
    downloadBookingInvoice(bookingId: string, userType: UserType): Promise<Buffer>;
    getReviewData(providerId: string, filters: ReviewFilterDto): Promise<IResponse<IReviewWithPagination>>;
}