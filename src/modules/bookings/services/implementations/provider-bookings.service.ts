import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import { ADMIN_SETTINGS_MAPPER, BOOKING_MAPPER, CUSTOMER_MAPPER, PROVIDER_MAPPER, PROVIDER_SERVICE_MAPPER, SERVICE_OFFERED_MAPPER, TRANSACTION_MAPPER, WALLET_LEDGER_MAPPER, WALLET_MAPPER } from '@core/constants/mappers.constant';
import { IBookingMapper } from '@core/dto-mapper/interface/bookings.mapper.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { ITransaction } from '@core/entities/interfaces/transaction.entity.interface';
import { ITransactionMapper } from '@core/dto-mapper/interface/transaction.mapper.interface';
import { CurrencyType, PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '@core/enum/transaction.enum';
import { IAdminSettingsRepository } from '@core/repositories/interfaces/admin-settings-repo.interface';
import { IWalletRepository } from '@core/repositories/interfaces/wallet-repo.interface';
import { NOTIFICATION_SERVICE_NAME, PDF_SERVICE } from '@core/constants/service.constant';
import { IPdfService } from '@core/services/pdf/pdf.interface';
import { ClientUserType, ICustomer, IProvider } from '@core/entities/interfaces/user.entity.interface';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { PAYMENT_LOCKING_UTILITY_NAME, UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { IUploadsUtility } from '@core/utilities/interface/upload.utility.interface';
import { IServiceOfferedMapper } from '@core/dto-mapper/interface/serviceOffered.mapper.interface';
import { IProviderBookingService } from '@modules/bookings/services/interfaces/provider-booking-service.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ADMIN_SETTINGS_REPOSITORY_NAME, BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, PROVIDER_SERVICE_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME, WALLET_LEDGER_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { IProviderServiceRepository } from '@core/repositories/interfaces/provider-service-repo.interface';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { IBookedService, IBooking, IBookingDetailProvider, IBookingInvoice, IBookingOverviewChanges, IBookingOverviewData, IProviderBookingListService, IResponseProviderBookingLists, IReviewDetails, IReviewFilter, IReviewWithPagination } from '@core/entities/interfaces/booking.entity.interface';
import { FilterFields, ReviewFilterDto } from '@modules/bookings/dtos/booking.dto';
import { BookingStatus, CancelStatus, DateRange, PaymentStatus } from '@core/enum/bookings.enum';
import { IResponse } from '@core/misc/response.util';
import { IWalletLedgerRepository } from '@core/repositories/interfaces/wallet-ledger.repo.interface';
import { IWalletLedgerMapper } from '@core/dto-mapper/interface/wallet-ledger.mapper.interface';
import { IWalletMapper } from '@core/dto-mapper/interface/wallet.mapper.interface';
import { IAdminSettings } from '@core/entities/interfaces/admin-settings.entity.interface';
import { IAdminSettingMapper } from '@core/dto-mapper/interface/admin-setting.mapper.interface';
import { IWallet } from '@core/entities/interfaces/wallet.entity.interface';
import { IPaymentLockingUtility } from '@core/utilities/interface/payment-locking.utility';
import { IProviderServiceMapper } from '@core/dto-mapper/interface/provider-service.mapper.interface';
import { NotificationTemplateId, NotificationType } from '@core/enum/notification.enum';
import { INotificationService } from '@modules/websockets/services/interface/notification-service.interface';

@Injectable()
export class ProviderBookingService implements IProviderBookingService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(PROVIDER_SERVICE_REPOSITORY_NAME)
        private readonly _providerServiceRepository: IProviderServiceRepository,
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
        @Inject(WALLET_LEDGER_REPOSITORY_NAME)
        private readonly _walletLedgerRepository: IWalletLedgerRepository,
        @Inject(WALLET_LEDGER_MAPPER)
        private readonly _walletLedgerMapper: IWalletLedgerMapper,
        @Inject(WALLET_MAPPER)
        private readonly _walletMapper: IWalletMapper,
        @Inject(ADMIN_SETTINGS_MAPPER)
        private readonly _adminSettingsMapper: IAdminSettingMapper,
        @Inject(PAYMENT_LOCKING_UTILITY_NAME)
        private readonly _paymentLockingUtility: IPaymentLockingUtility,
        @Inject(PROVIDER_SERVICE_MAPPER)
        private readonly _providerServiceMapper: IProviderServiceMapper,
        @Inject(NOTIFICATION_SERVICE_NAME)
        private readonly _notificationService: INotificationService,
    ) {
        this.logger = this._loggerFactory.createLogger(ProviderBookingService.name);
    }

    private async _getAdminWallet(): Promise<IWallet> {
        const adminWalletDoc = await this._walletRepository.getAdminWallet();
        if (!adminWalletDoc) throw new InternalServerErrorException('Admin wallet not found');
        return this._walletMapper.toEntity(adminWalletDoc);
    }

    private async _getUserWallet(userId: string): Promise<IWallet> {
        const userWalletDoc = await this._walletRepository.findWallet(userId);
        if (!userWalletDoc) {
            this.logger.error(`Wallet not found for user ${userId}`);
            throw new InternalServerErrorException('User wallet not found');
        }
        return this._walletMapper.toEntity(userWalletDoc);
    }

    private async _getAdminSettings(): Promise<IAdminSettings> {
        const adminSettingsDoc = await this._adminSettings.getSettings();
        if (!adminSettingsDoc) {
            throw new InternalServerErrorException('Admin settings not found');
        }

        return this._adminSettingsMapper.toEntity(adminSettingsDoc);
    }

    private async _handleWalletUpdateOnBookingCancellation(providerId: string, customerId: string, bookingId: string, transaction: ITransaction, adminSettings: IAdminSettings, journalId: string | null, isRequestedForCancellation: boolean = false,) {
        let adminWallet = await this._getAdminWallet();
        const [customerWallet, providerWallet] = await Promise.all([
            this._getUserWallet(customerId),
            this._getUserWallet(providerId),
        ]);

        const totalPaid = transaction.amount;
        const customerFine = isRequestedForCancellation ? (adminSettings.cancellationFee ?? 0) : 0;
        const providerFine = adminSettings.providerCancellationFine ?? 0;

        const customerCreditAmount = Math.max(0, totalPaid - customerFine);
        const adminDebitAmount = totalPaid;

        const providerCreditAmount = isRequestedForCancellation ? customerFine : 0;
        const providerDebitAmount = isRequestedForCancellation ? 0 : providerFine;

        // Admin ledger: admin debits totalPaid
        await this._walletLedgerRepository.create(
            this._walletLedgerMapper.toDocument({
                walletId: adminWallet.id,
                userId: adminWallet.userId,
                userRole: 'admin',
                direction: PaymentDirection.DEBIT,
                type: TransactionType.BOOKING_REFUND,
                source: PaymentSource.WALLET,
                amount: adminDebitAmount,
                currency: CurrencyType.INR,
                balanceBefore: adminWallet.balance,
                balanceAfter: adminWallet.balance - adminDebitAmount,
                journalId,
                bookingId,
                bookingTransactionId: null,
                subscriptionId: null,
                subscriptionTransactionId: null,
                gatewayOrderId: null,
                gatewayPaymentId: null,
            }),
        );

        const adminWalletUpdated = await this._walletRepository.updateAdminAmount(-adminDebitAmount);

        if (!adminWalletUpdated) {
            this.logger.error('Failed to update admin wallet.');
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }

        adminWallet = await this._getAdminWallet();

        // Customer ledger & update: credit customer with refund
        await this._walletLedgerRepository.create(
            this._walletLedgerMapper.toDocument({
                walletId: customerWallet.id,
                userId: customerWallet.userId,
                userRole: 'customer',
                direction: PaymentDirection.CREDIT,
                type: TransactionType.BOOKING_REFUND,
                source: PaymentSource.WALLET,
                amount: customerCreditAmount,
                currency: CurrencyType.INR,
                balanceBefore: customerWallet.balance,
                balanceAfter: customerWallet.balance + customerCreditAmount,
                journalId,
                bookingId,
                bookingTransactionId: null,
                subscriptionId: null,
                subscriptionTransactionId: null,
                gatewayOrderId: null,
                gatewayPaymentId: null,
            }),
        );

        const customerWalletUpdated = await this._walletRepository.updateUserAmount(customerId, 'customer', customerCreditAmount);

        if (!customerWalletUpdated) {
            this.logger.error('Failed to update customer wallet.');
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }

        if (isRequestedForCancellation) {
            if (providerCreditAmount > 0) {
                // CREDIT provider with customerFine
                await this._walletLedgerRepository.create(
                    this._walletLedgerMapper.toDocument({
                        walletId: providerWallet.id,
                        userId: providerWallet.userId,
                        userRole: 'provider',
                        direction: PaymentDirection.CREDIT,
                        type: TransactionType.CANCELLATION_FEE,
                        source: PaymentSource.WALLET,
                        amount: providerCreditAmount,
                        currency: CurrencyType.INR,
                        balanceBefore: providerWallet.balance,
                        balanceAfter: providerWallet.balance + providerCreditAmount,
                        journalId,
                        bookingId,
                        bookingTransactionId: null,
                        subscriptionId: null,
                        subscriptionTransactionId: null,
                        gatewayOrderId: null,
                        gatewayPaymentId: null,
                    }),
                );

                const providerWalletUpdated = await this._walletRepository.updateUserAmount(providerId, 'provider', providerCreditAmount);
                if (!providerWalletUpdated) {
                    this.logger.error('Failed to update provider wallet (credit).');
                    throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
                }
            } else {
                if (providerDebitAmount > 0) {
                    // DEBIT provider with providerFine
                    await this._walletLedgerRepository.create(
                        this._walletLedgerMapper.toDocument({
                            walletId: providerWallet.id,
                            userId: providerWallet.userId,
                            userRole: 'provider',
                            direction: PaymentDirection.DEBIT,
                            type: TransactionType.CANCELLATION_FEE,
                            source: PaymentSource.WALLET,
                            amount: providerDebitAmount,
                            currency: CurrencyType.INR,
                            balanceBefore: providerWallet.balance,
                            balanceAfter: providerWallet.balance - providerDebitAmount,
                            journalId,
                            bookingId,
                            bookingTransactionId: null,
                            subscriptionId: null,
                            subscriptionTransactionId: null,
                            gatewayOrderId: null,
                            gatewayPaymentId: null,
                        }),
                    );

                    const providerWalletUpdated = await this._walletRepository.updateUserAmount(providerId, 'provider', -providerDebitAmount);
                    if (!providerWalletUpdated) {
                        this.logger.error('Failed to update provider wallet (debit).');
                        throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
                    }

                    // Credit admin with provider fine
                    await this._walletLedgerRepository.create(
                        this._walletLedgerMapper.toDocument({
                            walletId: adminWallet.id,
                            userId: adminWallet.userId,
                            userRole: 'admin',
                            direction: PaymentDirection.CREDIT,
                            type: TransactionType.CANCELLATION_FEE,
                            source: PaymentSource.WALLET,
                            amount: providerDebitAmount,
                            currency: CurrencyType.INR,
                            balanceBefore: adminWallet.balance,
                            balanceAfter: adminWallet.balance + providerDebitAmount,
                            journalId,
                            bookingId,
                            bookingTransactionId: null,
                            subscriptionId: null,
                            subscriptionTransactionId: null,
                            gatewayOrderId: null,
                            gatewayPaymentId: null,
                        }),
                    );

                    const adminCreditOk = await this._walletRepository.updateAdminAmount(providerDebitAmount);
                    if (!adminCreditOk) {
                        this.logger.error('Failed to credit admin with provider fine.');
                        throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
                    }
                }
            }
        }
    }

    private async _getBookedServices(servicesIds: string[]): Promise<IBookedService[]> {
        return (
            await Promise.all(
                servicesIds.map(async (s) => {
                    const service = await this._providerServiceRepository.findOneAndPopulateById(s);

                    if (!service) throw new InternalServerErrorException({
                        code: ErrorCodes.INTERNAL_SERVER_ERROR,
                        message: ErrorMessage.INTERNAL_SERVER_ERROR
                    });

                    return {
                        title: service.description,
                        price: service.price,
                        estimatedTime: service.estimatedTimeInMinutes
                    };
                })
            )
        );
    }

    private _computeRefund(totalPaid: number, adminSettings: IAdminSettings): { refundAmount: number; customerFine: number; providerFine: number } {
        const customerFine = adminSettings.cancellationFee;
        const providerFine = adminSettings.providerCancellationFine;

        const refundAmount = Math.max(0, totalPaid - customerFine);

        return {
            refundAmount,   // amount to credit customer (paisa)
            customerFine,   // fee charged to customer (paisa)
            providerFine,   // fee to be charged to provider (paisa) — handle separately
        };
    }

    private _getBookingPaymentTransactionDetail(transactions: ITransaction[]): ITransaction {
        const transaction = transactions
            .filter(t => t.transactionType === TransactionType.BOOKING_PAYMENT && t.status === TransactionStatus.SUCCESS)
            .sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime())[0];

        if (!transaction) {
            throw new InternalServerErrorException({
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
                message: 'Transaction not found',
            });
        }
        return transaction;
    }

    private async _getCustomerAndService(booking: IBooking): Promise<{
        customer: { id: string, name: string, email: string, phone: string, location: string };
        service: { title: string, price: number, estimatedTime: number }[];
    }> {
        const customerDoc = await this._customerRepository.findById(booking.customerId);
        if (!customerDoc) {
            throw new InternalServerErrorException(`Customer with ID ${booking.customerId} not found.`);
        }

        const customer = this._customerMapper.toEntity(customerDoc);
        const orderedServices = await this._getBookedServices(booking.services);

        return {
            customer: {
                id: customer.id,
                name: customer.fullname || customer.username,
                email: customer.email,
                phone: customer.phone,
                location: customer.address,
            },
            service: orderedServices,
        };
    }

    private async _sendNotification(
        userId: string,
        templateId: NotificationTemplateId,
        type: NotificationType,
        title: string,
        message: string,
        entityId?: string,
        metadata?: any
    ) {
        try {
            await this._notificationService.createNotification(userId, {
                templateId,
                type,
                title,
                message,
                entityId,
                metadata
            });
        } catch (error) {
            this.logger.error('Failed to send notification', error);
            throw new Error('Failed to send notification');
        }
    }

    private async _getInvoiceUser(booking: IBooking, userType: ClientUserType,): Promise<IProvider | ICustomer> {
        if (userType === 'customer') {
            const customerDoc = await this._customerRepository.findById(
                booking.customerId,
            );
            if (!customerDoc) {
                throw new NotFoundException({
                    code: ErrorCodes.NOT_FOUND,
                    message: `Customer ${ErrorMessage.DOCUMENT_NOT_FOUND}`,
                });
            }
            return this._customerMapper.toEntity(customerDoc);
        }

        const providerDoc = await this._providerRepository.findById(
            booking.providerId,
        );
        if (!providerDoc) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: `Provider ${ErrorMessage.DOCUMENT_NOT_FOUND}`,
            });
        }
        return this._providerMapper.toEntity(providerDoc);
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

                const services: IProviderBookingListService[] = await Promise.all(
                    booking.services.map(async (id) => {
                        const serviceDoc = await this._providerServiceRepository.findOneAndPopulateById(id);

                        if (!serviceDoc) throw new InternalServerErrorException({
                            code: ErrorCodes.INTERNAL_SERVER_ERROR,
                            message: `Service not found: ${id}`,
                        });

                        const service = this._providerServiceMapper.toPopulatedEntity(serviceDoc);
                        return {
                            id: service.id,
                            title: service.category.name as string,
                            image: service.image
                        };
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
            const date = new Date(filters.date);
            date.setHours(0, 0, 0, 0);

            filteredBookings = filteredBookings.filter((booking) => {
                const expectedArrivalTime = new Date(booking.expectedArrivalTime);
                expectedArrivalTime.setHours(0, 0, 0, 0);
                return date.getTime() === expectedArrivalTime.getTime();
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
        const bookings = await this._bookingRepository.findBookingsByProviderId(providerId)
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
        const bookingDoc = await this._bookingRepository.findPaidBookings(bookingId);
        if (!bookingDoc) {
            throw new InternalServerErrorException(`Booking with ID ${bookingId} not found.`);
        }

        const booking = this._bookingMapper.toEntity(bookingDoc);
        const transaction = this._getBookingPaymentTransactionDetail(booking.transactionHistory);

        const { customer, service: orderedServices } = await this._getCustomerAndService(booking);

        return {
            bookingId: booking.id,
            bookingStatus: booking.bookingStatus,
            paymentStatus: booking.paymentStatus,
            createdAt: booking.createdAt as Date,
            expectedArrivalTime: booking.expectedArrivalTime,
            actualArrivalTime: booking.actualArrivalTime,
            totalAmount: booking.totalAmount / 100,
            cancelStatus: booking.cancelStatus,
            cancelReason: booking.cancellationReason,
            cancelledAt: booking.cancelledAt,
            customer,
            orderedServices,
            transaction: transaction ? {
                id: transaction.id,
                paymentDate: transaction.createdAt as Date,
                paymentMethod: transaction.source
            } : null,
        }
    }

    async markBookingCancelledByProvider(providerId: string, bookingId: string, reason?: string): Promise<IResponse<IBookingDetailProvider>> {
        const bookingDoc = await this._bookingRepository.findPaidBookings(bookingId);
        if (!bookingDoc) {
            throw new InternalServerErrorException(`Booking with ID ${bookingId} not found.`);
        }

        const customer = await this._customerRepository.findById(bookingDoc.customerId);
        if (!customer) {
            throw new InternalServerErrorException(`Customer with ID ${bookingDoc.customerId} not found.`);
        }

        let booking = this._bookingMapper.toEntity(bookingDoc);
        let transaction = this._getBookingPaymentTransactionDetail(booking.transactionHistory);

        const alreadyRefunded = bookingDoc.transactionHistory
            .filter(t => t.transactionType === TransactionType.BOOKING_REFUND && t.status === TransactionStatus.SUCCESS)
            .length > 0;

        if (alreadyRefunded) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'This booking has already been refunded.'
            });
        }

        const isAlreadyRequestedForCancellation = bookingDoc.cancelStatus === CancelStatus.IN_PROGRESS;

        if (booking.paymentStatus === PaymentStatus.PAID) {
            const adminSettings = await this._getAdminSettings()

            let customerCreditAmount = transaction.amount;
            const { refundAmount } = this._computeRefund(transaction.amount, adminSettings);
            if (isAlreadyRequestedForCancellation) {
                customerCreditAmount = refundAmount;
            }

            const refundedBookingTransaction = await this._transactionRepository.createNewTransaction(
                bookingId,
                this._transactionMapper.toDocument({
                    userId: booking.customerId,
                    transactionType: TransactionType.BOOKING_REFUND,
                    direction: PaymentDirection.CREDIT,
                    amount: customerCreditAmount,
                    currency: CurrencyType.INR,
                    source: transaction.source,
                    status: TransactionStatus.REFUNDED,
                    gateWayDetails: null,
                    userDetails: null,
                    metadata: null
                }),
            );

            if (!refundedBookingTransaction) {
                this.logger.error('Transaction not created for booking ' + bookingId);
                throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
            }

            const adminWalletLedger = await this._walletLedgerRepository.getAdminWalletLedgerByTransactionId(transaction.id);

            await this._handleWalletUpdateOnBookingCancellation(
                providerId,
                booking.customerId,
                bookingId,
                transaction,
                adminSettings,
                adminWalletLedger?.journalId ?? null,
                isAlreadyRequestedForCancellation
            );

            await this._bookingRepository.updatePaymentStatus(bookingId, PaymentStatus.REFUNDED);
        }

        const updatedBookingDoc = await this._bookingRepository.markBookingCancelledByProvider(
            providerId,
            bookingId,
            BookingStatus.CANCELLED,
            CancelStatus.CANCELLED,
            reason
        );

        if (!updatedBookingDoc) {
            this.logger.error('while cancelling booking ' + bookingId + 'Updated booking document not found for ' + bookingId);
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'This booking cannot be cancelled at this stage.'
            });
        }

        const updatedBooking = this._bookingMapper.toEntity(updatedBookingDoc);
        transaction = this._getBookingPaymentTransactionDetail(updatedBooking.transactionHistory);

        const orderedServices = await this._getBookedServices(updatedBooking.services);//todo-today

        const bookingData: IBookingDetailProvider = {
            bookingId: updatedBookingDoc.id,
            bookingStatus: updatedBookingDoc.bookingStatus,
            paymentStatus: updatedBookingDoc.paymentStatus,
            createdAt: updatedBookingDoc.createdAt as Date,
            expectedArrivalTime: updatedBookingDoc.expectedArrivalTime,
            actualArrivalTime: updatedBookingDoc.actualArrivalTime,
            totalAmount: updatedBookingDoc.totalAmount,
            cancelStatus: updatedBookingDoc.cancelStatus,
            cancelReason: updatedBookingDoc.cancellationReason,
            cancelledAt: updatedBookingDoc.cancelledAt,
            customer: {
                id: customer.id,
                name: customer.fullname || customer.username,
                email: customer.email,
                phone: customer.phone,
                location: updatedBookingDoc.location.address,
            },
            orderedServices,
            transaction: {
                id: transaction.id,
                paymentDate: transaction.createdAt as Date,
                paymentMethod: transaction.source
            }
        }

        // Notify Customer
        await this._sendNotification(
            booking.customerId,
            NotificationTemplateId.BOOKING_CANCELLED,
            NotificationType.EVENT,
            'Booking Cancelled',
            `Your booking #${updatedBooking.id.slice(-6)} has been cancelled.`,
            updatedBooking.id,
            { bookingId: updatedBooking.id, role: 'customer' }
        );

        return {
            success: true,
            message: 'Status updated successfully',
            data: bookingData
        }
    }

    async downloadBookingInvoice(bookingId: string, userType: ClientUserType): Promise<Buffer> {
        const bookingDoc = await this._bookingRepository.findById(bookingId);
        if (!bookingDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: `Booking ${ErrorMessage.DOCUMENT_NOT_FOUND}`
        });

        const booking = this._bookingMapper.toEntity(bookingDoc);

        if (booking.bookingStatus !== BookingStatus.COMPLETED) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Booking is not completed.'
            });
        }

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

        const paymentTransactions = (booking.transactionHistory ?? [])
            .filter(t =>
                t.transactionType === TransactionType.BOOKING_PAYMENT &&
                t.status === TransactionStatus.SUCCESS,
            )
            .sort((a, b) => (a.createdAt as any) - (b.createdAt as any));

        const transaction = paymentTransactions.at(-1);

        const settings = await this._adminSettings.getSettings();
        const providerAmountWithCommission = transaction?.metadata?.breakup?.providerAmount as number;
        const providerAmount = Math.floor(providerAmountWithCommission / (1 + (settings.providerCommission) / 100));
        const commission = providerAmountWithCommission - providerAmount;

        const invoiceData: IBookingInvoice = {
            invoiceId: booking.id,
            transactionId: booking.transactionHistory
                .find(t => t.transactionType === TransactionType.BOOKING_PAYMENT && t.status === TransactionStatus.SUCCESS)?.id ?? null,
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

        const [reviewDetails, reviewCount] = await Promise.all([
            this._bookingRepository.getReviews(providerId, filterFinal, { page, limit }),
            this._bookingRepository.countReviews(providerId)
        ]);

        for (let review of reviewDetails) {
            review.customer.avatar = this._uploadUtility.getSignedImageUrl(review.customer.avatar);
        }

        return {
            success: true,
            message: "Fetched review data successfully.",
            data: {
                reviewDetails: reviewDetails,
                pagination: { page, limit, total: reviewCount }
            }
        }
    }

    async updateBookingStatus(bookingId: string, newStatus: BookingStatus): Promise<IResponse> {
        const isCancelled = await this._bookingRepository.isAlreadyRequestedForCancellation(bookingId);
        if (isCancelled) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: ErrorMessage.BOOKING_ALREADY_CANCELLED
        });

        const updatedBooking = await this._bookingRepository.updateBookingStatus(bookingId, newStatus);
        if (!updatedBooking) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: ErrorMessage.BOOKING_ALREADY_CANCELLED
        });

        const booking = this._bookingMapper.toEntity(updatedBooking);

        // Notify Customer
        await this._sendNotification(
            booking.customerId,
            NotificationTemplateId.BOOKING_STATUS_UPDATED,
            NotificationType.EVENT,
            'Booking Cancelled',
            `Your booking #${updatedBooking.id.slice(-6)} has been ${newStatus}.`,
            updatedBooking.id,
            { bookingId: updatedBooking.id, role: 'provider' }
        );


        return {
            success: !!updatedBooking,
            message: 'Booking status updated successfully.',
        }
    }

    async completeBooking(providerId: string, bookingId: string): Promise<IResponse<IBookingDetailProvider>> {
        const key = this._paymentLockingUtility.generatePaymentKey(providerId, 'provider');
        try {
            const isLocked = await this._paymentLockingUtility.acquireLock(key);
            if (!isLocked) throw new BadRequestException({
                code: ErrorCodes.PAYMENT_IN_PROGRESS,
                message: 'A similar operation is already in progress.'
            });

            const bookingDoc = await this._bookingRepository.findById(bookingId);
            if (!bookingDoc) throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Booking not found.'
            });

            if (bookingDoc.providerId.toString() !== providerId) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'You are not authorized to complete this booking.'
                });
            }

            const booking = this._bookingMapper.toEntity(bookingDoc);

            if (booking.paymentStatus === PaymentStatus.UNPAID || !booking.transactionHistory.some(t => t.transactionType === TransactionType.BOOKING_PAYMENT)) throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'This booking has not been paid yet.'
            });

            if (booking.bookingStatus === BookingStatus.COMPLETED) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: ErrorMessage.BOOKING_ALREADY_COMPLETED
                });
            }

            if (booking.bookingStatus === BookingStatus.CANCELLED || booking.paymentStatus === PaymentStatus.REFUNDED) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: ErrorMessage.BOOKING_ALREADY_CANCELLED
                });
            }

            const isAlreadyReleased = booking.transactionHistory.some(tnx => tnx.transactionType === TransactionType.BOOKING_RELEASE);
            if (isAlreadyReleased) throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.BOOKING_ALREADY_COMPLETED
            });

            let adminWallet = await this._getAdminWallet();
            const [adminSettings, providerWallet] = await Promise.all([
                this._getAdminSettings(),
                this._getUserWallet(booking.providerId),
            ]);

            const totalAmount = booking.totalAmount;
            const providerCommissionInPercentage = adminSettings.providerCommission;
            const gstPercentage = adminSettings.gstPercentage;

            const commissionAmount = Math.floor(totalAmount * (providerCommissionInPercentage / 100));
            const gstAmount = Math.floor(commissionAmount * (gstPercentage / 100));

            const totalDeductions = commissionAmount + gstAmount;
            const finalAmount = totalAmount - totalDeductions;

            const bookingReleaseTransaction = await this._transactionRepository.createNewTransaction(bookingId,
                this._transactionMapper.toDocument({
                    userId: booking.providerId,
                    transactionType: TransactionType.BOOKING_RELEASE,
                    direction: PaymentDirection.CREDIT,
                    amount: finalAmount,
                    currency: CurrencyType.INR,
                    source: PaymentSource.WALLET,
                    status: TransactionStatus.SUCCESS,
                    gateWayDetails: null,
                    userDetails: null,
                    metadata: null
                })
            );

            if (!bookingReleaseTransaction) {
                this.logger.error('Transaction not created for booking ' + bookingId);
                throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
            }

            const transaction = this._getBookingPaymentTransactionDetail(booking.transactionHistory);
            const adminWalletLedger = await this._walletLedgerRepository.getAdminWalletLedgerByTransactionId(transaction.id);

            if (adminWallet.balance < finalAmount) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: ErrorMessage.INSUFFICIENT_BALANCE
                });
            }

            const adminWalletUpdate = await this._walletRepository.updateAdminAmount(-finalAmount);
            if (!adminWalletUpdate) {
                this.logger.error('Admin wallet update failed for the release of booking ' + bookingId);
                throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
            }

            const providerWalletUpdate = await this._walletRepository.updateUserAmount(providerWallet.userId, 'provider', finalAmount);
            if (!providerWalletUpdate) {
                await this._walletRepository.updateAdminAmount(finalAmount);
                this.logger.error('Provider wallet update failed for the release of booking ' + bookingId);
                throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
            }

            const updatedBooking = await this._bookingRepository.updateBookingStatus(bookingId, BookingStatus.COMPLETED);
            if (!updatedBooking) {
                await this._walletRepository.updateAdminAmount(finalAmount);
                await this._walletRepository.updateUserAmount(providerWallet.userId, 'provider', -finalAmount);
                this.logger.error('Booking update failed for the release of booking ' + bookingId);
                throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
            }

            // DEBIT booking amount from admin wallet (after deducting commission and gst)
            await this._walletLedgerRepository.create(
                this._walletLedgerMapper.toDocument({
                    walletId: adminWallet.id,
                    userId: adminWallet.userId,
                    userRole: 'admin',
                    direction: PaymentDirection.DEBIT,
                    type: TransactionType.BOOKING_RELEASE,
                    source: PaymentSource.WALLET,
                    amount: finalAmount,
                    currency: CurrencyType.INR,
                    balanceBefore: adminWallet.balance,
                    balanceAfter: adminWallet.balance - finalAmount,
                    journalId: adminWalletLedger?.journalId,
                    bookingId,
                    bookingTransactionId: null,
                    subscriptionId: null,
                    subscriptionTransactionId: null,
                    gatewayOrderId: null,
                    gatewayPaymentId: null,
                    metadata: {
                        totalAmount,
                        commissionAmount,
                        gstAmount,
                        finalAmount
                    }
                })
            );

            adminWallet = await this._getAdminWallet();

            // CREDIT commission to admin
            await this._walletLedgerRepository.create(
                this._walletLedgerMapper.toDocument({
                    walletId: adminWallet.id,
                    userId: adminWallet.userId,
                    userRole: 'admin',
                    direction: PaymentDirection.CREDIT,
                    type: TransactionType.PROVIDER_COMMISSION,
                    source: PaymentSource.WALLET,
                    amount: commissionAmount,
                    currency: CurrencyType.INR,
                    balanceBefore: adminWallet.balance,
                    balanceAfter: adminWallet.balance + commissionAmount,
                    journalId: adminWalletLedger?.journalId,
                    bookingId,
                    bookingTransactionId: null,
                    subscriptionId: null,
                    subscriptionTransactionId: null,
                    gatewayOrderId: null,
                    gatewayPaymentId: null,
                    metadata: {
                        totalAmount,
                        commissionAmount,
                        gstAmount,
                        finalAmount
                    }
                })
            );

            // CREDIT gst amount to admin (Provider Portion)
            await this._walletLedgerRepository.create(
                this._walletLedgerMapper.toDocument({
                    walletId: adminWallet.id,
                    userId: adminWallet.userId,
                    userRole: 'admin',
                    direction: PaymentDirection.CREDIT,
                    type: TransactionType.GST,
                    source: PaymentSource.WALLET,
                    amount: gstAmount,
                    currency: CurrencyType.INR,
                    balanceBefore: adminWallet.balance,
                    balanceAfter: adminWallet.balance + gstAmount,
                    journalId: adminWalletLedger?.journalId,
                    bookingId,
                    bookingTransactionId: null,
                    subscriptionId: null,
                    subscriptionTransactionId: null,
                    gatewayOrderId: null,
                    gatewayPaymentId: null,
                    metadata: {
                        totalAmount,
                        commissionAmount,
                        gstAmount,
                        finalAmount,
                        portion: 'provider'
                    }
                })
            );

            // CREDIT customer commission to admin (Categorization)
            const customerCommission = transaction.metadata?.breakup?.commission || 0;
            const customerGst = transaction.metadata?.breakup?.gst || 0;

            if (customerCommission > 0) {
                await this._walletLedgerRepository.create(
                    this._walletLedgerMapper.toDocument({
                        walletId: adminWallet.id,
                        userId: adminWallet.userId,
                        userRole: 'admin',
                        direction: PaymentDirection.CREDIT,
                        type: TransactionType.CUSTOMER_COMMISSION,
                        source: PaymentSource.WALLET,
                        amount: customerCommission,
                        currency: CurrencyType.INR,
                        balanceBefore: adminWallet.balance,
                        balanceAfter: adminWallet.balance + customerCommission,
                        journalId: adminWalletLedger?.journalId,
                        bookingId,
                        bookingTransactionId: null,
                        subscriptionId: null,
                        subscriptionTransactionId: null,
                        gatewayOrderId: null,
                        gatewayPaymentId: null,
                        metadata: {
                            totalAmount,
                            customerCommission,
                            customerGst,
                            portion: 'customer'
                        }
                    })
                );
            }

            if (customerGst > 0) {
                await this._walletLedgerRepository.create(
                    this._walletLedgerMapper.toDocument({
                        walletId: adminWallet.id,
                        userId: adminWallet.userId,
                        userRole: 'admin',
                        direction: PaymentDirection.CREDIT,
                        type: TransactionType.GST,
                        source: PaymentSource.WALLET,
                        amount: customerGst,
                        currency: CurrencyType.INR,
                        balanceBefore: adminWallet.balance,
                        balanceAfter: adminWallet.balance + customerGst,
                        journalId: adminWalletLedger?.journalId,
                        bookingId,
                        bookingTransactionId: null,
                        subscriptionId: null,
                        subscriptionTransactionId: null,
                        gatewayOrderId: null,
                        gatewayPaymentId: null,
                        metadata: {
                            totalAmount,
                            customerCommission,
                            customerGst,
                            portion: 'customer'
                        }
                    })
                );
            }

            // CREDIT booking amount to provider wallet
            await this._walletLedgerRepository.create(
                this._walletLedgerMapper.toDocument({
                    walletId: providerWallet.id,
                    userId: providerWallet.userId,
                    userRole: 'provider',
                    direction: PaymentDirection.CREDIT,
                    type: TransactionType.BOOKING_RELEASE,
                    source: PaymentSource.WALLET,
                    amount: finalAmount,
                    currency: CurrencyType.INR,
                    balanceBefore: providerWallet.balance,
                    balanceAfter: providerWallet.balance + finalAmount,
                    journalId: adminWalletLedger?.journalId,
                    bookingId,
                    bookingTransactionId: null,
                    subscriptionId: null,
                    subscriptionTransactionId: null,
                    gatewayOrderId: null,
                    gatewayPaymentId: null,
                    metadata: {
                        totalAmount,
                        commissionAmount,
                        gstAmount,
                        finalAmount
                    }
                })
            );

            const bookingResponseData = this._bookingMapper.toEntity(updatedBooking)
            const { customer, service: orderedServices } = await this._getCustomerAndService(bookingResponseData);
            const bookingResponse: IBookingDetailProvider = {
                bookingId: booking.id,
                bookingStatus: booking.bookingStatus,
                paymentStatus: booking.paymentStatus,
                createdAt: booking.createdAt as Date,
                expectedArrivalTime: booking.expectedArrivalTime,
                actualArrivalTime: booking.actualArrivalTime,
                totalAmount: booking.totalAmount / 100,
                cancelStatus: booking.cancelStatus,
                cancelReason: booking.cancellationReason,
                cancelledAt: booking.cancelledAt,
                customer: {
                    ...customer,
                    location: booking.location.address,
                },
                orderedServices,
                transaction: {
                    id: transaction.id,
                    paymentDate: transaction.createdAt as Date,
                    paymentMethod: transaction.source
                }
            }

            // Notify Customer
            await this._sendNotification(
                booking.customerId,
                NotificationTemplateId.BOOKING_COMPLETED,
                NotificationType.EVENT,
                'Booking Completed',
                `Your booking #${updatedBooking.id.slice(-6)} has been completed.`,
                updatedBooking.id,
                { bookingId: updatedBooking.id, role: 'provider' }
            );

            return {
                success: true,
                message: 'Booking completed successfully.',
                data: bookingResponse
            }
        } catch (error) {
            this.logger.error('Error in completeBooking: ' + error);
            throw error;
        } finally {
            await this._paymentLockingUtility.releaseLock(key);
        }
    }

    async canStartVideoCall(providerId: string, customerId: string): Promise<IResponse> {
        const hasOngoingBooking = await this._bookingRepository.isAnyBookingOngoing(customerId, providerId);
        return {
            success: hasOngoingBooking,
            message: hasOngoingBooking ? "OK to call" : 'No ongoing booking found.'
        }
    }
}
