import { IBookingDetailProvider, IBookingOverviewData, IResponseProviderBookingLists } from "../../../../core/entities/interfaces/booking.entity.interface";
import { FilterFileds, UpdateBookingStatusDto } from "../../dtos/booking.dto";

export interface IProviderBookingService {
    fetchBookingsList(id: string, page: number, bookingFilters: FilterFileds): Promise<IResponseProviderBookingLists>;
    fetchOverviewData(id: string): Promise<IBookingOverviewData>;
    fetchBookingDetails(bookingId: string): Promise<IBookingDetailProvider>;
    updateBookingStatus(dto: UpdateBookingStatusDto): Promise<boolean>;
}