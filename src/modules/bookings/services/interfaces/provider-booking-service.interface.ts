import { IProviderBookingLists } from "../../../../core/entities/interfaces/booking.entity.interface";

export interface IProviderBookingService {
    fetchBookingsList(): Promise<IProviderBookingLists[]>;
}