import { IBookingDetailCustomer, IBookingWithPagination } from "../../../../core/entities/interfaces/booking.entity.interface";
import { BookingDto, IPriceBreakupDto, SelectedServiceDto } from "../../dtos/booking.dto";

export interface IBookingService {
    preparePriceBreakup(dto: SelectedServiceDto[]): Promise<IPriceBreakupDto>;
    createBooking(customerId: string, bookingData: BookingDto): Promise<boolean>;
    fetchBookings(id: string, page: number): Promise<IBookingWithPagination>;
    fetchBookingDetails(bookingId: string): Promise<IBookingDetailCustomer>;
}