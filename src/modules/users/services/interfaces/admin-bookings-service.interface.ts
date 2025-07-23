import { IAdminBookingForTable, IBookingStats } from "src/core/entities/interfaces/booking.entity.interface";
import { IResponse } from "src/core/misc/response.util";

export interface IAdminBookingService {
    fetchBookings(page: number): Promise<IResponse<IAdminBookingForTable[]>>;
    getBookingStats(): Promise<IResponse<IBookingStats>>;
}