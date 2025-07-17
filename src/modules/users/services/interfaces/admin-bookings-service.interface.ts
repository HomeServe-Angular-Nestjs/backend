import { IAdminBookingForTable } from "src/core/entities/interfaces/booking.entity.interface";
import { IResponse } from "src/core/misc/response.util";

export interface IAdminBookingService {
    fetchBookings(page: number): Promise<IResponse<IAdminBookingForTable[]>>;
}