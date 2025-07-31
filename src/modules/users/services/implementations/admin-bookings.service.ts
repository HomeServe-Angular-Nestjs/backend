import {
    BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME
} from '@/core/constants/repository.constant';
import {
    IAdminBookingForTable, IBookingStats, IPaginatedBookingsResponse
} from '@/core/entities/interfaces/booking.entity.interface';
import { ErrorMessage } from '@/core/enum/error.enum';
import { IResponse } from '@/core/misc/response.util';
import { IBookingRepository } from '@/core/repositories/interfaces/bookings-repo.interface';
import { ICustomerRepository } from '@/core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@/core/repositories/interfaces/provider-repo.interface';
import { PDF_SERVICE } from '@core/constants/service.constant';
import { IBookingMatrixData, IBookingReportData, IReportDownloadBookingData, ReportCategoryType } from '@core/entities/interfaces/admin.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { createBookingReportTableTemplate, IBookingTableTemplate } from '@core/services/pdf/mappers/booking-report.mapper';
import { IPdfService } from '@core/services/pdf/pdf.interface';
import { BookingReportDownloadDto, GetBookingsFilter } from '@modules/users/dtos/admin-user.dto';
import {
    IAdminBookingService
} from '@modules/users/services/interfaces/admin-bookings-service.interface';
import {
    Inject, Injectable, InternalServerErrorException, NotFoundException
} from '@nestjs/common';

@Injectable()
export class AdminBookingService implements IAdminBookingService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(PDF_SERVICE)
        private readonly _pdfService: IPdfService,
    ) {
        this.logger = this.loggerFactory.createLogger(AdminBookingService.name)
    }

    private _computeBookingMatrix(data: IBookingReportData[]): IBookingMatrixData {
        const initial = {
            totalSpend: 0,
            totalRefunded: 0,
            pending: 0,
            confirmed: 0,
            cancelled: 0,
        };

        const aggregated = data.reduce((acc, doc) => {
            const amount = parseFloat(doc.totalAmount as string);
            acc.totalSpend += isNaN(amount) ? 0 : amount;

            switch (doc.bookingStatus) {
                case 'pending': acc.pending++; break;
                case 'confirmed': acc.confirmed++; break;
                case 'cancelled': acc.cancelled++; break;
            }

            if (doc.paymentStatus === 'refunded') {
                acc.totalRefunded += isNaN(amount) ? 0 : amount;
            }

            return acc;
        }, initial);

        const totalBookings = data.length;
        const averageSpend = totalBookings > 0
            ? (aggregated.totalSpend / totalBookings).toFixed(2)
            : '0.00';

        return {
            totalBookings,
            totalSpend: aggregated.totalSpend.toFixed(2),
            totalRefunded: aggregated.totalRefunded.toFixed(2),
            averageSpend,
            pending: aggregated.pending,
            confirmed: aggregated.confirmed,
            cancelled: aggregated.cancelled,
        };
    }

    async fetchBookings(dto: GetBookingsFilter): Promise<IResponse<IPaginatedBookingsResponse>> {
        const page = dto.page || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        let bookingFilter: any = {};

        // Search by Customer name/email (partial match)
        if (dto.search && dto.searchBy === 'customer') {
            const customers = await this._customerRepository.find({
                $or: [
                    { username: { $regex: dto.search, $options: 'i' } },
                    { email: { $regex: dto.search, $options: 'i' } },
                ],
            });

            const customerIds = customers.map((c) => c.id);
            bookingFilter.customerId = { $in: customerIds };
        }

        // Filter by booking status
        if (dto.bookingStatus) {
            bookingFilter.bookingStatus = dto.bookingStatus;
        }

        // Filter by payment status
        if (dto.paymentStatus) {
            bookingFilter.paymentStatus = dto.paymentStatus;
        }

        // Fetch bookings and total count
        const [bookings, total] = await Promise.all([
            this._bookingRepository.find(bookingFilter, {
                skip,
                limit,
                sort: { createdAt: -1 },
            }),
            this._bookingRepository.count(bookingFilter),
        ]);

        // Build response
        const bookingResponseData: IAdminBookingForTable[] = await Promise.all(
            bookings.map(async (booking) => {
                const [customer, provider] = await Promise.all([
                    this._customerRepository.findById(booking.customerId),
                    this._providerRepository.findById(booking.providerId),
                ]);

                if (!customer) {
                    throw new NotFoundException(ErrorMessage.CUSTOMER_NOT_FOUND_WITH_ID, booking.customerId);
                }

                if (!provider) {
                    throw new NotFoundException(ErrorMessage.PROVIDER_NOT_FOUND, booking.providerId);
                }

                return {
                    bookingId: booking.id,
                    customer: {
                        avatar: customer.avatar,
                        id: customer.id,
                        username: customer.username,
                        email: customer.email,
                    },
                    provider: {
                        avatar: provider.avatar,
                        id: provider.id,
                        username: provider.username,
                        email: provider.email,
                    },
                    date: booking.createdAt as Date,
                    status: booking.bookingStatus,
                    paymentStatus: booking.paymentStatus,
                };
            }),
        );

        let filteredBookings = bookingResponseData;
        if (dto.search && dto.searchBy === 'id') {
            filteredBookings = filteredBookings.filter(b =>
                b.bookingId.toLowerCase().includes(dto.search.toLowerCase())
            );
        }

        return {
            success: true,
            message: 'Booking data fetched successfully',
            data: {
                bookingData: filteredBookings,
                pagination: {
                    total,
                    page,
                    limit,
                },
            },
        };
    }

    async getBookingStats(): Promise<IResponse<IBookingStats>> {
        const bookingStats = await this._bookingRepository.bookingStatus();
        if (!bookingStats) {
            throw new InternalServerErrorException('Mongo aggregation failed.');
        }

        return {
            success: true,
            message: 'Booking stats fetched.',
            data: bookingStats
        }
    }

    async downloadBookingReport(reportFilterData: BookingReportDownloadDto): Promise<Buffer> {
        const { category, ...reportDownloadData }: { category: ReportCategoryType } = reportFilterData;
        const bookingReportData = await this._bookingRepository.generateBookingReport(reportDownloadData);

        const table1ColumnData = ['Booking ID', 'Customer Email', 'Provider Email', 'Phone', 'Total Amount (₹)', 'Date', 'Booking Status', 'Payment Status', 'Transaction ID'];
        const table2ColumnData = ['Total Bookings', 'Total Spend', 'Total Refund', 'Average Spend (paid)', 'Pending', 'Confirmed', 'Cancelled'];

        const bookingMatrixData = this._computeBookingMatrix(bookingReportData);

        const tableData: IBookingTableTemplate[] = [
            {
                rows: bookingMatrixData,
                columns: table2ColumnData,
                type: 'single'
            },
            {
                rows: bookingReportData,
                columns: table1ColumnData,
                type: 'normal'
            },
        ];

        const tables = createBookingReportTableTemplate(tableData);
        return this._pdfService.generatePdf(tables);
    }
}