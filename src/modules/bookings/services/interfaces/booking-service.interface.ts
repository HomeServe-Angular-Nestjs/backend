import { IBooking, IBookingDetailCustomer, IBookingResponse, IBookingWithPagination } from '@core/entities/interfaces/booking.entity.interface';
import { AddReviewDto, IPriceBreakupDto, SaveBookingDto, UpdateBookingDto, UpdateBookingPaymentStatusDto } from '@modules/bookings/dtos/booking.dto';
import { IResponse } from '@core/misc/response.util';

export interface IBookingService {
    createBooking(customerId: string, bookingData: SaveBookingDto): Promise<IResponse<IBooking>>;
    fetchBookings(customerId: string, page: number): Promise<IBookingWithPagination>;
    fetchBookingDetails(bookingId: string): Promise<IBookingDetailCustomer>;
    markBookingCancelledByCustomer(customerId: string, bookingId: string, reason: string): Promise<IResponse<IBookingResponse>>;
    updateBooking(bookingDto: UpdateBookingDto): Promise<IResponse<IBookingResponse>>;
    // updateBookingPaymentStatus(bookingDto: UpdateBookingPaymentStatusDto): Promise<IResponse<boolean>>;
    addReview(reviewDto: AddReviewDto): Promise<IResponse>;
    canStartVideoCall(customerId: string, providerId: string): Promise<IResponse>;
    fetchPriceBreakup(customerId: string): Promise<IResponse<IPriceBreakupDto>>;
}

