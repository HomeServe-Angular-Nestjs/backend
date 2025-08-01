import {
    IBookingDetailProvider, IBookingOverviewData, IResponseProviderBookingLists
} from '@core/entities/interfaces/booking.entity.interface';
import { IResponse } from '@core/misc/response.util';
import { FilterFields, UpdateBookingStatusDto } from '@modules/bookings/dtos/booking.dto';

export interface IProviderBookingService {
    fetchBookingsList(id: string, page: number, bookingFilters: FilterFields): Promise<IResponseProviderBookingLists>;
    fetchOverviewData(id: string): Promise<IBookingOverviewData>;
    fetchBookingDetails(bookingId: string): Promise<IBookingDetailProvider>;
    updateBookingStatus(dto: UpdateBookingStatusDto): Promise<IResponse<IBookingDetailProvider>>;
}