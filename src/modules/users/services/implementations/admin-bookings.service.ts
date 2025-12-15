import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from '@/core/constants/repository.constant';
import { IAdminBookingDetails, IAdminBookingForTable, IBookingStats, IPaginatedBookingsResponse } from '@/core/entities/interfaces/booking.entity.interface';
import { ErrorCodes, ErrorMessage } from '@/core/enum/error.enum';
import { IResponse } from '@/core/misc/response.util';
import { IBookingRepository } from '@/core/repositories/interfaces/bookings-repo.interface';
import { ICustomerRepository } from '@/core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@/core/repositories/interfaces/provider-repo.interface';
import { PDF_SERVICE } from '@core/constants/service.constant';
import { IBookingMatrixData, IBookingReportData, ReportCategoryType } from '@core/entities/interfaces/admin.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { createBookingReportTableTemplate, IBookingTableTemplate } from '@core/services/pdf/mappers/booking-report.mapper';
import { IPdfService } from '@core/services/pdf/pdf.interface';
import { BookingReportDownloadDto, GetBookingsFilter } from '@modules/users/dtos/admin-user.dto';
import { IAdminBookingService } from '@modules/users/services/interfaces/admin-bookings-service.interface';
import { BOOKING_MAPPER, CUSTOMER_MAPPER, PROVIDER_MAPPER } from '@core/constants/mappers.constant';
import { IBookingMapper } from '@core/dto-mapper/interface/bookings.mapper.interface';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';
import { ClientUserType } from '@core/entities/interfaces/user.entity.interface';
import { TransactionStatus, TransactionType } from '@core/enum/transaction.enum';

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
        @Inject(BOOKING_MAPPER)
        private readonly _bookingMapper: IBookingMapper,
        @Inject(CUSTOMER_MAPPER)
        private readonly _customerMapper: ICustomerMapper,
        @Inject(PROVIDER_MAPPER)
        private readonly _providerMapper: IProviderMapper,
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

    async fetchBookings(getBookingsFilter: GetBookingsFilter): Promise<IResponse<IPaginatedBookingsResponse>> {
        const page = getBookingsFilter.page || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        let bookingFilter: any = {};

        // Search by Customer name/email (partial match)
        if (getBookingsFilter.search && getBookingsFilter.searchBy === 'customer') {
            const customers = await this._customerRepository.find({
                $or: [
                    { username: { $regex: getBookingsFilter.search, $options: 'i' } },
                    { email: { $regex: getBookingsFilter.search, $options: 'i' } },
                ],
            }); //todo

            const customerIds = customers.map((c) => c.id);
            bookingFilter.customerId = { $in: customerIds };
        }

        // Filter by booking status
        if (getBookingsFilter.bookingStatus) {
            bookingFilter.bookingStatus = getBookingsFilter.bookingStatus;
        }

        // Filter by payment status
        if (getBookingsFilter.paymentStatus) {
            bookingFilter.paymentStatus = getBookingsFilter.paymentStatus;
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
                    throw new NotFoundException(`${ErrorMessage.CUSTOMER_NOT_FOUND_WITH_ID, booking.customerId}`);
                }

                if (!provider) {
                    throw new NotFoundException(`${ErrorMessage.PROVIDER_NOT_FOUND, booking.providerId}`);
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
        if (getBookingsFilter.search && getBookingsFilter.searchBy === 'id') {
            filteredBookings = filteredBookings.filter(b =>
                b.bookingId.toLowerCase().includes(getBookingsFilter.search.toLowerCase())
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

    async getBookingDetails(bookingId: string): Promise<IResponse<IAdminBookingDetails>> {
        const bookingDoc = await this._bookingRepository.findById(bookingId);
        if (!bookingDoc) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Booking not found.',
            });
        }

        const [customerDoc, providerDoc] = await Promise.all([
            this._customerRepository.findById(bookingDoc.customerId),
            this._providerRepository.findById(bookingDoc.providerId),
        ]);

        if (!customerDoc) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Customer not found.',
            });
        }

        if (!providerDoc) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Provider not found.',
            });
        }

        const booking = this._bookingMapper.toEntity(bookingDoc);
        const customer = this._customerMapper.toEntity(customerDoc);
        const provider = this._providerMapper.toEntity(providerDoc);

        const transactionHistory = await Promise.all(
            booking.transactionHistory.map(async tnx => {
                const [customerDoc, providerDoc] = await Promise.all([
                    this._customerRepository.findById(tnx.userId),
                    this._providerRepository.findById(tnx.userId),
                ]);

                let user: ClientUserType | null = null;
                if (customerDoc) user = 'customer';
                else if (providerDoc) user = 'provider';

                if (!user) {
                    throw new InternalServerErrorException({
                        code: ErrorCodes.INTERNAL_SERVER_ERROR,
                        message: 'User not found.',
                    });
                }

                return {
                    date: tnx.createdAt?.toISOString() as string,
                    user: user,
                    type: tnx.transactionType,
                    direction: tnx.direction,
                    amount: tnx.amount / 100,
                    status: tnx.status,
                }
            })
        );

        const breakdownTxn = booking.transactionHistory
            .filter(tnx => tnx.transactionType === TransactionType.BOOKING_PAYMENT && tnx.status === TransactionStatus.SUCCESS)
            .sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime())[0];

        const breakdown = breakdownTxn
            ? {
                providerAmount: breakdownTxn.metadata?.breakup?.providerAmount ?? 0,
                commissionEarned: breakdownTxn.metadata?.breakup?.commission ?? 0,
                gst: breakdownTxn.metadata?.breakup?.gst ?? 0,
            }
            : {
                providerAmount: 0,
                commissionEarned: 0,
                gst: 0,
            };

        const bookingResponse: IAdminBookingDetails = {
            bookingId: booking.id,
            totalAmount: booking.totalAmount / 100,
            expectedArrival: booking.expectedArrivalTime,
            actualArrival: booking.actualArrivalTime,
            bookingStatus: booking.bookingStatus,
            paymentStatus: booking.paymentStatus,
            createdAt: booking.createdAt?.toISOString() as string,
            customer: {
                phone: customer.phone,
                role: 'customer',
                email: customer.email,
            },
            provider: {
                phone: provider.phone,
                role: 'provider',
                email: provider.email,
            },
            location: {
                address: booking.location.address,
                coordinates: booking.location.coordinates,
            },
            transactionHistory: transactionHistory,
            breakdown: {
                customerPaid: booking.totalAmount / 100,
                providerAmount: breakdown.providerAmount / 100,
                commissionEarned: breakdown.commissionEarned / 100,
                gst: breakdown.gst / 100,
            }
        }

        return {
            success: true,
            message: 'Booking details fetched.',
            data: bookingResponse
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