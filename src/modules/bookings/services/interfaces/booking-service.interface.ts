import { IPriceBreakupData, SelectedServiceDto } from "../../dtos/booking.dto";

export interface IBookingService {
    preparePriceBreakup(dto: SelectedServiceDto[]): Promise<IPriceBreakupData>;
}