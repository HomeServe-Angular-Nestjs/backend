import type { IAdminBookingDetails, IBookingStats, IPaginatedBookingsResponse } from '@/core/entities/interfaces/booking.entity.interface';
import type { IResponse } from '@/core/misc/response.util';
import type { BookingReportDownloadDto, AdminBookingFilterDto } from '@modules/users/dtos/admin-user.dto';

export interface IAdminBookingService {
  fetchBookings(filter: AdminBookingFilterDto): Promise<IResponse<IPaginatedBookingsResponse>>;
  getBookingStats(): Promise<IResponse<IBookingStats>>;
  getBookingDetails(bookingId: string): Promise<IResponse<IAdminBookingDetails>>;
  downloadBookingReport(reportFilterData: BookingReportDownloadDto): Promise<Buffer>;
}
