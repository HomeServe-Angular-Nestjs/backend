import { IResponse } from "src/core/misc/response.util";
import { IBookingDetailCustomer, IBookingWithPagination } from "../../../../core/entities/interfaces/booking.entity.interface";
import { BookingDto, BookingIdDto, CancelBookingDto, IPriceBreakupDto, SelectedServiceDto } from "../../dtos/booking.dto";

export interface IBookingService {
    preparePriceBreakup(dto: SelectedServiceDto[]): Promise<IPriceBreakupDto>;
    createBooking(customerId: string, bookingData: BookingDto): Promise<IResponse>;
    fetchBookings(id: string, page: number): Promise<IBookingWithPagination>;
    fetchBookingDetails(bookingId: string): Promise<IBookingDetailCustomer>;
    cancelBooking(dto: CancelBookingDto): Promise<IResponse>;
}