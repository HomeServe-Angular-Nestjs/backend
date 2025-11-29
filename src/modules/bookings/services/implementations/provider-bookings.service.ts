import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import { BOOKING_MAPPER, CUSTOMER_MAPPER, PROVIDER_MAPPER, SERVICE_OFFERED_MAPPER, TRANSACTION_MAPPER } from '@core/constants/mappers.constant';
import { IBookingMapper } from '@core/dto-mapper/interface/bookings.mapper.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { ITransaction, ITransactionMetadata } from '@core/entities/interfaces/transaction.entity.interface';
import { ITransactionMapper } from '@core/dto-mapper/interface/transaction.mapper.interface';
import { IAdminRepository } from '@core/repositories/interfaces/admin-repo.interface';
import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '@core/enum/transaction.enum';
import { IAdminSettingsRepository } from '@core/repositories/interfaces/admin-settings-repo.interface';
import { IWalletRepository } from '@core/repositories/interfaces/wallet-repo.interface';
import { PDF_SERVICE } from '@core/constants/service.constant';
import { IPdfService } from '@core/services/pdf/pdf.interface';
import { ICustomer, IProvider, UserType } from '@core/entities/interfaces/user.entity.interface';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { IUploadsUtility } from '@core/utilities/interface/upload.utility.interface';
import { IServiceOfferedMapper } from '@core/dto-mapper/interface/serviceOffered.mapper.interface';
import { IProviderBookingService } from '@modules/bookings/services/interfaces/provider-booking-service.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ADMIN_REPOSITORY_NAME, ADMIN_SETTINGS_REPOSITORY_NAME, BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SERVICE_OFFERED_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { IServiceOfferedRepository } from '@core/repositories/interfaces/serviceOffered-repo.interface';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { IBookedService, IBookingDetailProvider, IBookingInvoice, IBookingOverviewChanges, IBookingOverviewData, IResponseProviderBookingLists, IReviewDetails, IReviewFilter, IReviewWithPagination } from '@core/entities/interfaces/booking.entity.interface';
import { FilterFields, ReviewFilterDto } from '@modules/bookings/dtos/booking.dto';
import { BookingStatus, CancelStatus, DateRange, PaymentStatus } from '@core/enum/bookings.enum';
import { IResponse } from '@core/misc/response.util';

@Injectable()
export class ProviderBookingService implements IProviderBookingService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
        private readonly _serviceOfferedRepository: IServiceOfferedRepository,
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(TRANSACTION_REPOSITORY_NAME)
        private readonly _transactionRepository: ITransactionRepository,
        @Inject(BOOKING_MAPPER)
        private readonly _bookingMapper: IBookingMapper,
        @Inject(TRANSACTION_MAPPER)
        private readonly _transactionMapper: ITransactionMapper,
        @Inject(ADMIN_REPOSITORY_NAME)
        private readonly _adminRepository: IAdminRepository,
        @Inject(ADMIN_SETTINGS_REPOSITORY_NAME)
        private readonly _adminSettings: IAdminSettingsRepository,
        @Inject(WALLET_REPOSITORY_NAME)
        private readonly _walletRepository: IWalletRepository,
        @Inject(SERVICE_OFFERED_MAPPER)
        private readonly _serviceMapper: IServiceOfferedMapper,
        @Inject(PDF_SERVICE)
        private readonly _pdfService: IPdfService,
        @Inject(CUSTOMER_MAPPER)
        private readonly _customerMapper: ICustomerMapper,
        @Inject(PROVIDER_MAPPER)
        private readonly _providerMapper: IProviderMapper,
        @Inject(UPLOAD_UTILITY_NAME)
        private readonly _uploadUtility: IUploadsUtility,
    ) {
        this.logger = this._loggerFactory.createLogger(ProviderBookingService.name);
    }

    private async _createCompleteBookingTransaction(providerId: string, transactionMetadata: ITransactionMetadata): Promise<number> {
        const settings = await this._adminSettings.getSettings();
        const adminId = await this._adminRepository.getAdminId();

        const customerCommission = transactionMetadata.breakup?.commission as number;
        const providerAmountWithCommission = transactionMetadata.breakup?.providerAmount as number;
        const gstAmount = transactionMetadata.breakup?.gst as number;

        if (!customerCommission || !gstAmount || !providerAmountWithCommission) {
            this.logger.error('Transaction metadata are found not found');
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }

        const providerAmount = Math.floor(providerAmountWithCommission / (1 + (settings.providerCommission) / 100));
        const providerCommission = providerAmountWithCommission - providerAmount;

        const createTx = (userId: string, type: TransactionType, amount: number, source: PaymentSource, direction: PaymentDirection) =>
            this._transactionMapper.toDocument({
                userId,
                transactionType: type,
                gateWayDetails: null,
                currency: 'INR',
                amount,
                userDetails: null,
                status: TransactionStatus.SUCCESS,
                direction,
                source,
                metadata: null,
            });

        await Promise.all([
            this._transactionRepository.create(
                createTx(adminId, TransactionType.CUSTOMER_COMMISSION, customerCommission, PaymentSource.INTERNAL, PaymentDirection.CREDIT)
            ),
            this._transactionRepository.create(
                createTx(adminId, TransactionType.PROVIDER_COMMISSION, providerCommission, PaymentSource.INTERNAL, PaymentDirection.CREDIT)
            ),
            this._transactionRepository.create(
                createTx(adminId, TransactionType.TAX, gstAmount, PaymentSource.INTERNAL, PaymentDirection.CREDIT)
            ),
            this._transactionRepository.create(
                createTx(adminId, TransactionType.BOOKING_RELEASE, providerAmount, PaymentSource.INTERNAL, PaymentDirection.DEBIT)
            ),
            this._transactionRepository.create(
                createTx(providerId, TransactionType.BOOKING_RELEASE, providerAmount, PaymentSource.RAZORPAY, PaymentDirection.CREDIT)
            ),
        ]);

        return providerAmount;
    }

    private async _getBookedServices(services: { serviceId: string; subserviceIds: string[]; }[]): Promise<IBookedService[]> {
        return (
            await Promise.all(
                services.map(async (s) => {
                    const service = await this._serviceOfferedRepository.findById(s.serviceId);
                    if (!service) {
                        throw new InternalServerErrorException(`Service with ID ${s.serviceId} not found.`);
                    }

                    return service.subService
                        .filter(sub => sub.id && s.subserviceIds.includes(sub.id))
                        .map(sub => ({
                            title: sub.title as string,
                            price: sub.price as string,
                            estimatedTime: sub.estimatedTime as string
                        }));
                })
            )
        ).flat();
    }

    async fetchBookingsList(providerId: string, page: number = 1, filters: FilterFields): Promise<IResponseProviderBookingLists> {
        const limit = 5;
        const skip = (page - 1) * limit;

        const bookingDocuments = await this._bookingRepository.findBookingsByProviderId(providerId);
        if (!bookingDocuments.length) {
            return {
                bookingData: [],
                paginationData: { total: 0, page, limit }
            };
        }

        const bookings = bookingDocuments.map(booking => this._bookingMapper.toEntity(booking));

        const enrichBookings = await Promise.all(
            bookings.map(async (booking) => {
                const customer = await this._customerRepository.findById(booking.customerId);
                if (!customer) throw new InternalServerErrorException(`Customer not found: ${booking.customerId}`);

                const services = await Promise.all(
                    booking.services.map(async (s) => {
                        const service = await this._serviceOfferedRepository.findById(s.serviceId);
                        if (!service) throw new InternalServerErrorException(`Service not found: ${s.serviceId}`);
                        return { id: service.id, title: service.title, image: service.image };
                    })
                );

                return {
                    services,
                    customer: {
                        id: customer.id,
                        name: customer.fullname || customer.username,
                        email: customer.email,
                        avatar: customer.avatar
                    },
                    bookingId: booking.id,
                    expectedArrivalTime: booking.expectedArrivalTime,
                    totalAmount: booking.totalAmount,
                    createdAt: booking.createdAt as Date,
                    paymentStatus: booking.paymentStatus,
                    cancelStatus: booking.cancelStatus,
                    bookingStatus: booking.bookingStatus,
                };
            })
        );

        let filteredBookings = enrichBookings;

        // Filter by search
        if (filters.search) {
            const search = filters.search.trim().toLowerCase();
            filteredBookings = enrichBookings.filter((booking) => {
                return (
                    booking.bookingId.toLowerCase().includes(search) ||
                    booking.customer.name.toLowerCase().includes(search) ||
                    booking.customer.email.toLowerCase().includes(search) ||
                    booking.services.some((s) => s.title.toLowerCase().includes(search))
                );
            });
        }

        // Filter by bookingStatus
        if (filters.bookingStatus) {
            filteredBookings = filteredBookings.filter(
                (booking) => booking.bookingStatus === filters.bookingStatus
            );
        }

        // Filter by paymentStatus
        if (filters.paymentStatus) {
            filteredBookings = filteredBookings.filter(
                (booking) => booking.paymentStatus === filters.paymentStatus
            );
        }

        if (filters.date) {
            const today = new Date();

            filteredBookings = filteredBookings.filter((booking) => {
                const expectedArrivalTime = new Date(booking.expectedArrivalTime);

                switch (filters.date) {
                    case DateRange.TODAY:
                        return expectedArrivalTime.toDateString() === today.toDateString();
                    case DateRange.THIS_WEEK: {
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDate());
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        return expectedArrivalTime >= weekStart && expectedArrivalTime <= weekEnd;
                    }
                    case DateRange.THIS_MONTH:
                        return expectedArrivalTime.getMonth() === today.getMonth() &&
                            expectedArrivalTime.getFullYear() === today.getFullYear();
                    case DateRange.THIS_YEAR:
                        return expectedArrivalTime.getFullYear() === today.getFullYear();
                    default:
                        return true;
                }
            });

        }

        const total = filteredBookings.length;
        const paginated = filteredBookings.slice(skip, skip + limit);

        return {
            bookingData: paginated,
            paginationData: { page, limit, total }
        }
    }

    async fetchOverviewData(providerId: string): Promise<IBookingOverviewData> {
        const bookings = await this._bookingRepository.find({ providerId });
        const now = new Date();

        const getMonthRange = (date: Date) => ({
            start: new Date(date.getFullYear(), date.getMonth(), 1),
            end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999),
        });

        // Date ranges for current and last month
        const thisMonthRange = getMonthRange(now);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthRange = getMonthRange(lastMonthDate);

        // Filter bookings by month with safety check for createdAt
        const bookingsThisMonth = bookings.filter(
            b => b.createdAt !== undefined &&
                b.createdAt >= thisMonthRange.start && b.createdAt <= thisMonthRange.end
        );

        const bookingsLastMonth = bookings.filter(
            b => b.createdAt !== undefined &&
                b.createdAt >= lastMonthRange.start && b.createdAt <= lastMonthRange.end
        );

        // Function to calculate summary counts
        const summarize = (list: typeof bookings) =>
            list.reduce(
                (acc, b) => {
                    if (b.bookingStatus === BookingStatus.PENDING) acc.pendingRequests++;
                    if (b.bookingStatus === BookingStatus.COMPLETED) acc.completedJobs++;
                    if (b.paymentStatus === PaymentStatus.UNPAID) acc.pendingPayments++;
                    if (b.bookingStatus === BookingStatus.CANCELLED) acc.cancelledBookings++;
                    return acc;
                },
                {
                    pendingRequests: 0,
                    completedJobs: 0,
                    pendingPayments: 0,
                    cancelledBookings: 0,
                }
            );

        // Calculate summaries for this and last month
        const summaryThisMonth = summarize(bookingsThisMonth);
        const summaryLastMonth = summarize(bookingsLastMonth);

        // Total bookings for each month
        const totalThisMonth = bookingsThisMonth.length;
        const totalLastMonth = bookingsLastMonth.length;

        // Helper for percentage calculation with safe zero check
        const calcPercentChange = (current: number, previous: number): number => {
            if (previous === 0) {
                return current === 0 ? 0 : 100;
            }
            return ((current - previous) / previous) * 100;
        };

        // Calculate percentage changes with correct property names matching IBookingOverviewChanges interface
        const changes: IBookingOverviewChanges = {
            totalBookingsChange: calcPercentChange(totalThisMonth, totalLastMonth),
            pendingRequestsChange: calcPercentChange(summaryThisMonth.pendingRequests, summaryLastMonth.pendingRequests),
            completedJobsChange: calcPercentChange(summaryThisMonth.completedJobs, summaryLastMonth.completedJobs),
            pendingPaymentsChange: calcPercentChange(summaryThisMonth.pendingPayments, summaryLastMonth.pendingPayments),
            cancelledBookingsChange: calcPercentChange(summaryThisMonth.cancelledBookings, summaryLastMonth.cancelledBookings),
        };

        return {
            ...summaryThisMonth,
            totalBookings: totalThisMonth,
            changes,
        };
    }

    async fetchBookingDetails(bookingId: string): Promise<IBookingDetailProvider> {
        const booking = await this._bookingRepository.findById(bookingId);
        if (!booking) {
            throw new InternalServerErrorException(`Booking with ID ${bookingId} not found.`);
        }

        const customer = await this._customerRepository.findById(booking.customerId);
        if (!customer) {
            throw new InternalServerErrorException(`Provider with ID ${booking.customerId} not found.`);
        }

        const transaction = booking.transactionId
            ? await this._transactionRepository.findById(booking.transactionId)
            : null;

        const orderedServices = (
            await Promise.all(
                booking.services.map(async (s) => {
                    const service = await this._serviceOfferedRepository.findById(s.serviceId);
                    if (!service) {
                        throw new InternalServerErrorException(`Service with ID ${s.serviceId} not found.`);
                    }

                    return service.subService
                        .filter(sub => sub.id && s.subserviceIds.includes(sub.id))
                        .map(sub => ({
                            title: sub.title as string,
                            price: sub.price as string,
                            estimatedTime: sub.estimatedTime as string
                        }));
                })
            )
        ).flat();

        return {
            bookingId: booking.id,
            bookingStatus: booking.bookingStatus,
            paymentStatus: booking.paymentStatus,
            createdAt: booking.createdAt as Date,
            expectedArrivalTime: booking.expectedArrivalTime,
            totalAmount: booking.totalAmount,
            cancelStatus: booking.cancelStatus,
            cancelReason: booking.cancellationReason,
            cancelledAt: booking.cancelledAt,
            customer: {
                id: customer.id,
                name: customer.fullname || customer.username,
                email: customer.email,
                phone: customer.phone,
                location: booking.location.address,
            },
            orderedServices,
            transaction: transaction ? {
                id: transaction.id,
                paymentDate: transaction.createdAt as Date,
                paymentMethod: transaction.direction as string
            } : null
        }
    }

    async markBookingCancelledByProvider(bookingId: string, reason?: string): Promise<IResponse<IBookingDetailProvider>> {
        const updatedBookingDoc = await this._bookingRepository.markBookingCancelledByProvider(
            bookingId,
            BookingStatus.CANCELLED,
            CancelStatus.CANCELLED,
            reason
        );

        if (!updatedBookingDoc) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: 'Unable to cancel booking. Try reloading the page.'
        });

        const updatedBooking = this._bookingMapper.toEntity(updatedBookingDoc);
        const customer = await this._customerRepository.findById(updatedBooking.customerId);
        if (!customer) {
            throw new InternalServerErrorException(`Customer with ID ${updatedBooking.customerId} not found.`);
        }

        const orderedServices = await this._getBookedServices(updatedBooking.services);

        let transaction = updatedBooking.transactionId
            ? await this._transactionRepository.findById(updatedBooking.transactionId) : null;

        if (updatedBooking.paymentStatus === PaymentStatus.PAID) {
            const providerAmount = await this._createCompleteBookingTransaction(
                String(updatedBooking.providerId),
                transaction?.metadata as ITransactionMetadata
            );

            await Promise.all([
                this._walletRepository.updateAdminAmount(-providerAmount),
                this._walletRepository.updateProviderBalance(String(updatedBooking.providerId), providerAmount),
                this._bookingRepository.updatePaymentStatus(bookingId, PaymentStatus.REFUNDED, transaction?.id ?? null), //!todo
            ]);
        }

        const bookingData: IBookingDetailProvider = {
            bookingId: updatedBooking.id,
            bookingStatus: updatedBooking.bookingStatus,
            paymentStatus: updatedBooking.paymentStatus,
            createdAt: updatedBooking.createdAt as Date,
            expectedArrivalTime: updatedBooking.expectedArrivalTime,
            totalAmount: updatedBooking.totalAmount,
            cancelStatus: updatedBooking.cancelStatus,
            cancelReason: updatedBooking.cancellationReason,
            cancelledAt: updatedBooking.cancelledAt,
            customer: {
                id: customer.id,
                name: customer.fullname || customer.username,
                email: customer.email,
                phone: customer.phone,
                location: updatedBooking.location.address,
            },
            orderedServices,
            transaction: transaction ? {
                id: transaction.id,
                paymentDate: transaction.createdAt as Date,
                paymentMethod: transaction.direction as string
            } : null
        }
        return {
            success: true,
            message: 'Status updated successfully',
            data: bookingData
        }
    }

    async downloadBookingInvoice(bookingId: string, userType: UserType): Promise<Buffer> {
        const bookingDoc = await this._bookingRepository.findById(bookingId);
        if (!bookingDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: `Booking ${ErrorMessage.DOCUMENT_NOT_FOUND}`
        });

        const booking = this._bookingMapper.toEntity(bookingDoc);

        const services = await this._getBookedServices(booking.services);

        let user: IProvider | ICustomer;
        if (userType === 'customer') {
            const customerDoc = await this._customerRepository.findById(booking.customerId);
            if (!customerDoc) throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: `Customer ${ErrorMessage.DOCUMENT_NOT_FOUND}`
            });
            user = this._customerMapper.toEntity(customerDoc);
        } else {
            const providerDoc = await this._providerRepository.findById(booking.providerId);
            if (!providerDoc) throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: `Provider ${ErrorMessage.DOCUMENT_NOT_FOUND}`
            });
            user = this._providerMapper.toEntity(providerDoc);
        }

        let transaction: ITransaction | null = null;
        if (booking.transactionId) {
            const tnxDoc = await this._transactionRepository.findById(booking.transactionId);
            if (!tnxDoc) throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: `Transaction ${ErrorMessage.DOCUMENT_NOT_FOUND}`
            });
            transaction = this._transactionMapper.toEntity(tnxDoc);
        }

        let providerAmount: number = 0;
        let commission = 0;
        if (transaction) {
            const settings = await this._adminSettings.getSettings();
            const providerAmountWithCommission = transaction?.metadata?.breakup?.providerAmount as number;
            providerAmount = Math.floor(providerAmountWithCommission / (1 + (settings.providerCommission) / 100));
            commission = providerAmountWithCommission - providerAmount;
        }

        const invoiceData: IBookingInvoice = {
            invoiceId: booking.id,
            transactionId: booking.transactionId ?? null,
            paymentStatus: booking.paymentStatus,
            paymentSource: transaction ? transaction.source : null,
            transactionType: transaction ? transaction.transactionType : null,
            currency: transaction ? transaction.currency : null,
            userType: 'provider',
            services,

            user: {
                name: user.username,
                email: user.email,
                contact: user?.phone,
            },

            bookingDetails: {
                status: booking.bookingStatus,
                expectedArrivalTime: booking.expectedArrivalTime.toISOString(),
                actualArrivalTime: booking.actualArrivalTime?.toISOString() ?? null,
                slot: {
                    from: booking.slot.from,
                    to: booking.slot.to,
                },
            },

            location: {
                address: user.address,
                coordinates: user?.location?.coordinates as [number, number]
            },

            paymentBreakup: {
                gst: transaction ? transaction.metadata?.breakup?.gst as number : 0,
                total: booking.totalAmount,
                providerAmount,
                commission
            },

            paymentDetails: transaction && transaction.gateWayDetails ? {
                orderId: transaction.gateWayDetails.orderId,
                paymentId: transaction.gateWayDetails.paymentId,
                receipt: transaction.gateWayDetails.receipt ?? '',
                signature: transaction.gateWayDetails.signature
            } : null
        };

        return this._pdfService.generateBookingInvoice(invoiceData);
    }

    async fetchBookedSlots(providerId: string): Promise<IResponse> {
        const [bookedSlotDocument] = await Promise.all([
            // this._bookingRepository.findBookedSlotsByProviderId(providerId),
            this._bookingRepository
        ]);
        return {
            success: true,
            message: ''
        }
    }

    async getReviewData(providerId: string, filter: ReviewFilterDto): Promise<IResponse<IReviewWithPagination>> {
        const limit = 10;
        const { page, ...filters } = filter;
        const filterFinal: IReviewFilter = {};

        if (filters?.search) {
            filterFinal.search = filters.search;
        }

        if (filters?.rating && filters.rating !== 'all') {
            filterFinal.rating = filters.rating;
        }

        if (filters?.time && filters.time !== 'all') {
            filterFinal.time = filters.time;
        }

        if (filter?.sort) {
            filterFinal.sort = filter.sort;
        }

        const [reviewCount, result] = await Promise.all([
            this._bookingRepository.countReviews(providerId),
            this._bookingRepository.getReviews(providerId, filterFinal, { page, limit })
        ]);

        const response: IReviewDetails[] = result.map(review => {
            const subServiceIds = review.services.flatMap(s => s.subserviceIds.map(id => id.toString()));
            const subServiceTitles: string[] = [];

            for (const serviceDetailDoc of review.serviceDetails || []) {
                const serviceDetail = this._serviceMapper.toEntity(serviceDetailDoc);

                const matchedSubs =
                    (serviceDetail.subService ?? []).filter((sub) => {
                        if (sub.id) {
                            return subServiceIds.includes(sub.id.toString())
                        }
                        return false;
                    }) || [];

                matchedSubs.forEach((sub) => {
                    if (sub.title) {
                        return subServiceTitles.push(sub.title)
                    }
                });
            }

            return {
                id: review.id,
                avatar: this._uploadUtility.getSignedImageUrl(review.avatar),
                username: review.username,
                email: review.email,
                rating: review.rating,
                desc: review.desc,
                writtenAt: review.writtenAt,
                serviceTitles: subServiceTitles
            }
        });

        return {
            success: true,
            message: "Fetched review data successfully.",
            data: {
                reviewDetails: response,
                pagination: { page, limit, total: reviewCount }
            }
        }
    }

    async updateBookingStatus(bookingId: string, newStatus: BookingStatus): Promise<IResponse<IBookingDetailProvider>> {
        const isCancelled = await this._bookingRepository.isAlreadyRequestedForCancellation(bookingId);
        if (isCancelled) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: ErrorMessage.BOOKING_ALREADY_CANCELLED
        });

        const updated = await this._bookingRepository.updateBookingStatus(bookingId, newStatus);
        if (!updated) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: ErrorMessage.BOOKING_ALREADY_CANCELLED
        });

        return {
            success: updated,
            message: ErrorMessage.BOOKING_ALREADY_CANCELLED
        }
    }
}
