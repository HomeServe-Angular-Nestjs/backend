import { IBookingStats, IPaginatedBookingsResponse } from "src/core/entities/interfaces/booking.entity.interface";
import { IResponse } from "src/core/misc/response.util";
import { GetBookingsFilter } from "../../dtos/admin-user.dto";

export interface IAdminBookingService {
    fetchBookings(filter: GetBookingsFilter): Promise<IResponse<IPaginatedBookingsResponse>>;
    getBookingStats(): Promise<IResponse<IBookingStats>>;
}