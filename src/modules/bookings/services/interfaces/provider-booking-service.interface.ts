import { IBookingDetailProvider, IBookingOverviewData, IResponseProviderBookingLists, IReviewWithPagination } from '@core/entities/interfaces/booking.entity.interface';
import { UserType } from '@core/entities/interfaces/user.entity.interface';
import { BookingStatus } from '@core/enum/bookings.enum';
import { IResponse } from '@core/misc/response.util';
import { FilterFields, ReviewFilterDto } from '@modules/bookings/dtos/booking.dto';

export interface IProviderBookingService {
    fetchBookingsList(bookingId: string, page: number, bookingFilters: FilterFields): Promise<IResponseProviderBookingLists>;
    fetchOverviewData(bookingId: string): Promise<IBookingOverviewData>;
    fetchBookingDetails(bookingId: string): Promise<IBookingDetailProvider>;
    updateBookingStatus(bookingId: string, newStatus: BookingStatus): Promise<IResponse>;
    markBookingCancelledByProvider(providerId: string, bookingId: string, reason?: string): Promise<IResponse<IBookingDetailProvider>>;
    downloadBookingInvoice(bookingId: string, userType: UserType): Promise<Buffer>;
    getReviewData(providerId: string, filters: ReviewFilterDto): Promise<IResponse<IReviewWithPagination>>;
}