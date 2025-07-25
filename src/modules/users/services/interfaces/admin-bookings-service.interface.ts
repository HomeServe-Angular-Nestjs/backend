import {
    IBookingStats, IPaginatedBookingsResponse
} from '@/core/entities/interfaces/booking.entity.interface';
import { IResponse } from '@/core/misc/response.util';
import { GetBookingsFilter } from '@modules/users/dtos/admin-user.dto';

export interface IAdminBookingService {
    fetchBookings(filter: GetBookingsFilter): Promise<IResponse<IPaginatedBookingsResponse>>;
    getBookingStats(): Promise<IResponse<IBookingStats>>;
}