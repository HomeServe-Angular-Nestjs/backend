import { IBooking, IBookingResponse } from "../../../../core/entities/interfaces/booking.entity.interface";
import { BookingDto, IPriceBreakupDto, SelectedServiceDto } from "../../dtos/booking.dto";

export interface IBookingService {
    preparePriceBreakup(dto: SelectedServiceDto[]): Promise<IPriceBreakupDto>;
    createBooking(customerId: string, bookingData: BookingDto): Promise<boolean>;
    fetchBookings(id: string): Promise<IBookingResponse[]>;
}