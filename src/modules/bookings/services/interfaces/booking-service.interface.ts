import {
    IBookingDetailCustomer, IBookingResponse, IBookingWithPagination
} from '@core/entities/interfaces/booking.entity.interface';
import { IResponse } from '@core/misc/response.util';
import {
    BookingDto, CancelBookingDto, IPriceBreakupDto, SelectedServiceDto, UpdateBookingDto
} from '@modules/bookings/dtos/booking.dto';

export interface IBookingService {
    preparePriceBreakup(dto: SelectedServiceDto[]): Promise<IPriceBreakupDto>;
    createBooking(customerId: string, bookingData: BookingDto): Promise<IResponse>;
    fetchBookings(id: string, page: number): Promise<IBookingWithPagination>;
    fetchBookingDetails(bookingId: string): Promise<IBookingDetailCustomer>;
    cancelBooking(dto: CancelBookingDto): Promise<IResponse>;
    updateBooking(dto: UpdateBookingDto): Promise<IResponse<IBookingResponse>>;
}