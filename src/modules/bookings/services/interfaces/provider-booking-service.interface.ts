import { IBookingDetailProvider, IBookingOverviewData, IResponseProviderBookingLists, IReviewWithPagination } from '@core/entities/interfaces/booking.entity.interface';
import { IResponse } from '@core/misc/response.util';
import { UserType } from '@modules/auth/dtos/login.dto';
import { FilterFields, ReviewFilterDto, UpdateBookingStatusDto } from '@modules/bookings/dtos/booking.dto';

export interface IProviderBookingService {
    fetchBookingsList(id: string, page: number, bookingFilters: FilterFields): Promise<IResponseProviderBookingLists>;
    fetchOverviewData(id: string): Promise<IBookingOverviewData>;
    fetchBookingDetails(bookingId: string): Promise<IBookingDetailProvider>;
    updateBookingStatus(dto: UpdateBookingStatusDto): Promise<IResponse<IBookingDetailProvider>>;
    fetchBookedSlots(providerId: string): Promise<IResponse>;
    downloadBookingInvoice(bookingId: string, userType: UserType): Promise<Buffer>;
    getReviewData(providerId: string, filters: ReviewFilterDto): Promise<IResponse<IReviewWithPagination>>;
}