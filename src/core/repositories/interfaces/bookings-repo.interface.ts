import { FilterQuery, Types } from 'mongoose';
import { IBookingStats } from '@core/entities/interfaces/booking.entity.interface';
import { ITopProviders } from '@core/entities/interfaces/user.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { BookingDocument, SlotDocument } from '@core/schema/bookings.schema';
import { IBookingReportData, IReportCustomerMatrix, IReportDownloadBookingData, IReportProviderMatrix } from '@core/entities/interfaces/admin.entity.interface';
import { SlotStatusEnum } from '@core/enum/slot.enum';
import { BookingStatus, PaymentStatus } from '@core/enum/bookings.enum';

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
    findSlotsByDate(date: Date): Promise<SlotDocument[]>;
    findBookedSlots(ruleId: string): Promise<SlotDocument[]>;
    isAlreadyBooked(ruleId: string, from: string, to: string, dateISO: string): Promise<boolean>;
    updateSlotStatus(ruleId: string, from: string, to: string, dateISO: string, status: SlotStatusEnum): Promise<boolean>;
    cancelBooking(bookingId: string, reason: string): Promise<BookingDocument | null>;
    updatePaymentStatus(bookingId: string, status: PaymentStatus, transactionId: string): Promise<BookingDocument | null>;
    updateBookingStatus(bookingId: string, status: BookingStatus): Promise<BookingDocument | null>;
    getCompletionRate(): Promise<number>
}
