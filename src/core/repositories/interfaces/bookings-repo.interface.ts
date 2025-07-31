import { FilterQuery, UpdateQuery } from 'mongoose';

import { IBooking, IBookingStats } from '@core/entities/interfaces/booking.entity.interface';
import { ITopProviders } from '@core/entities/interfaces/user.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { BookingDocument } from '@core/schema/bookings.schema';
import { IBookingReportData, IReportCustomerMatrix, IReportDownloadBookingData, IReportProviderMatrix } from '@core/entities/interfaces/admin.entity.interface';

export interface IBookingRepository extends IBaseRepository<BookingDocument> {
    count(filter?: FilterQuery<BookingDocument>): Promise<number>;
    bookingStatus(): Promise<IBookingStats | null>;
    getTopProviders(): Promise<ITopProviders[]>;
    generateBookingReport(data: Partial<IReportDownloadBookingData>): Promise<IBookingReportData[]>;
    getCustomerReportMatrix(id: string): Promise<IReportCustomerMatrix>;
    getProviderReportMatrix(id: string): Promise<IReportProviderMatrix>
}