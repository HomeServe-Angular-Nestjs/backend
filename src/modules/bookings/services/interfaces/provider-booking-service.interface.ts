import { IBookingOverviewData, IResponseProviderBookingLists } from "../../../../core/entities/interfaces/booking.entity.interface";
import { FilterFileds } from "../../dtos/booking.dto";

export interface IProviderBookingService {
    fetchBookingsList(id: string, page: number, bookingFilters: FilterFileds): Promise<IResponseProviderBookingLists>;
    fetchOverviewData(id: string):Promise<IBookingOverviewData>
}