import { IResponseProviderBookingLists } from "../../../../core/entities/interfaces/booking.entity.interface";
import { FilterFileds } from "../../dtos/booking.dto";

export interface IProviderBookingService {
    fetchBookingsList(page: number, bookingFilters: FilterFileds): Promise<IResponseProviderBookingLists>;
}