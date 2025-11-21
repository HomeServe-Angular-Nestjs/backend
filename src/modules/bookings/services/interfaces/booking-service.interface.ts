import { IBookingDetailCustomer, IBookingResponse, IBookingWithPagination } from '@core/entities/interfaces/booking.entity.interface';
import { AddReviewDto, BookingDto, IPriceBreakupDto, SelectedServiceDto, UpdateBookingDto, UpdateBookingPaymentStatusDto } from '@modules/bookings/dtos/booking.dto';
import { IResponse } from '@core/misc/response.util';

export interface IBookingService {
    preparePriceBreakup(dto: SelectedServiceDto[]): Promise<IPriceBreakupDto>;
    createBooking(customerId: string, bookingData: BookingDto): Promise<IResponse>;
    fetchBookings(id: string, page: number): Promise<IBookingWithPagination>;
    fetchBookingDetails(bookingId: string): Promise<IBookingDetailCustomer>;
    markBookingCancelledByCustomer(bookingId: string, reason: string): Promise<IResponse>;
    updateBooking(dto: UpdateBookingDto): Promise<IResponse<IBookingResponse>>;
    updateBookingPaymentStatus(dto: UpdateBookingPaymentStatusDto): Promise<IResponse<boolean>>;
    addReview(dto: AddReviewDto): Promise<IResponse>;
}

