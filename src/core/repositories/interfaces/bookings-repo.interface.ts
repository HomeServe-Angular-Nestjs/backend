import { FilterQuery, Types, UpdateQuery } from 'mongoose';

import { IBooking, IBookingStats } from '@core/entities/interfaces/booking.entity.interface';
import { ITopProviders } from '@core/entities/interfaces/user.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { BookingDocument } from '@core/schema/bookings.schema';
import { IBookingReportData, IReportCustomerMatrix, IReportDownloadBookingData, IReportProviderMatrix } from '@core/entities/interfaces/admin.entity.interface';

export interface IBookingRepository extends IBaseRepository<BookingDocument> {
    findBookingsByCustomerIdWithPagination(customerId: string | Types.ObjectId, skip: number, limit: number): Promise<BookingDocument[]>;
    findBookingsByProviderId(providerId: string | Types.ObjectId): Promise<BookingDocument[]>;
    count(filter?: FilterQuery<BookingDocument>): Promise<number>;
    countDocumentsByCustomer(customerId: string | Types.ObjectId): Promise<number>;
    bookingStatus(): Promise<IBookingStats | null>;
    getTopProviders(): Promise<ITopProviders[]>;
    generateBookingReport(data: Partial<IReportDownloadBookingData>): Promise<IBookingReportData[]>;
    getCustomerReportMatrix(id: string): Promise<IReportCustomerMatrix>;
    getProviderReportMatrix(id: string): Promise<IReportProviderMatrix>;
    // findBookingsBySlotId(slotId: string): Promise<BookingDocument[]>;
}