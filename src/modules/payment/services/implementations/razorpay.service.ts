import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ADMIN_SETTINGS_REPOSITORY_NAME, BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SUBSCRIPTION_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME, WALLET_LEDGER_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { CUSTOMER_MAPPER, PROVIDER_MAPPER, SUBSCRIPTION_MAPPER, TRANSACTION_MAPPER, WALLET_LEDGER_MAPPER, WALLET_MAPPER } from '@core/constants/mappers.constant';
import { PAYMENT_LOCKING_UTILITY_NAME, PAYMENT_UTILITY_NAME } from '@core/constants/utility.constant';
import { ITransactionMapper } from '@core/dto-mapper/interface/transaction.mapper.interface';
import { IRazorpayOrder, ITransaction, ITxUserDetails, IVerifiedBookingsPayment, IVerifiedSubscriptionPayment } from '@core/entities/interfaces/transaction.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { IPaymentGateway } from '@core/utilities/interface/razorpay.utility.interface';
import { BookingOrderData, RazorpayVerifyData, SubscriptionOrderData } from '@modules/payment/dtos/payment.dto';
import { IRazorPaymentService } from '@modules/payment/services/interfaces/razorpay-service.interface';
import { CurrencyType, PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '@core/enum/transaction.enum';
import { IWalletRepository } from '@core/repositories/interfaces/wallet-repo.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { IAdminSettingsRepository } from '@core/repositories/interfaces/admin-settings-repo.interface';
import { ClientUserType, ICustomer, IProvider, UserType } from '@core/entities/interfaces/user.entity.interface';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';
import { CustomerDocument } from '@core/schema/customer.schema';
import { ProviderDocument } from '@core/schema/provider.schema';
import { ISubscriptionRepository } from '@core/repositories/interfaces/subscription-repo.interface';
import { ISubscription } from '@core/entities/interfaces/subscription.entity.interface';
import { ISubscriptionMapper } from '@core/dto-mapper/interface/subscription.mapper.interface';
import { IPaymentLockingUtility } from '@core/utilities/interface/payment-locking.utility';
import { TransactionDocument } from '@core/schema/bookings.schema';
import { IWalletLedgerRepository } from '@core/repositories/interfaces/wallet-ledger.repo.interface';
import { IWalletLedgerMapper } from '@core/dto-mapper/interface/wallet-ledger.mapper.interface';
import { v4 as uuid } from 'uuid';
import { IWalletMapper } from '@core/dto-mapper/interface/wallet.mapper.interface';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { NOTIFICATION_SERVICE_NAME } from '@core/constants/service.constant';
import { INotificationService } from '@modules/websockets/services/interface/notification-service.interface';
import { NotificationTemplateId, NotificationType } from '@core/enum/notification.enum';

@Injectable()
export class RazorPaymentService implements IRazorPaymentService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(PAYMENT_UTILITY_NAME)
        private readonly _paymentService: IPaymentGateway,
        @Inject(TRANSACTION_REPOSITORY_NAME)
        private readonly _transactionRepository: ITransactionRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(WALLET_REPOSITORY_NAME)
        private readonly _walletRepository: IWalletRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(TRANSACTION_MAPPER)
        private readonly _transactionMapper: ITransactionMapper,
        @Inject(ADMIN_SETTINGS_REPOSITORY_NAME)
        private readonly _adminSettingsRepository: IAdminSettingsRepository,
        @Inject(CUSTOMER_MAPPER)
        private readonly _customerMapper: ICustomerMapper,
        @Inject(PROVIDER_MAPPER)
        private readonly _providerMapper: IProviderMapper,
        @Inject(SUBSCRIPTION_REPOSITORY_NAME)
        private readonly _subscriptionRepository: ISubscriptionRepository,
        @Inject(SUBSCRIPTION_MAPPER)
        private readonly _subscriptionMapper: ISubscriptionMapper,
        @Inject(PAYMENT_LOCKING_UTILITY_NAME)
        private readonly _paymentLockingUtility: IPaymentLockingUtility,
        @Inject(WALLET_LEDGER_REPOSITORY_NAME)
        private readonly _walletLedgerRepository: IWalletLedgerRepository,
        @Inject(WALLET_LEDGER_MAPPER)
        private readonly _walletLedgerMapper: IWalletLedgerMapper,
        @Inject(WALLET_MAPPER)
        private readonly _walletMapper: IWalletMapper,
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(NOTIFICATION_SERVICE_NAME)
        private readonly _notificationService: INotificationService,
    ) {
        this.logger = this._loggerFactory.createLogger(RazorPaymentService.name);
    }

    private async _getUser(userId: string, role: ClientUserType): Promise<IProvider | ICustomer> {
        const repo = role === 'customer' ? this._customerRepository : this._providerRepository;
        if (!repo) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: `Invalid role provided: ${role}`
        });

        const userDoc = await repo.findById(userId);
        if (!userDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: `${role} with ID ${userId} not found.`
        });

        let user: IProvider | ICustomer;
        switch (role) {
            case 'customer':
                user = this._customerMapper.toEntity(userDoc as CustomerDocument);
                break;
            case 'provider':
                user = this._providerMapper.toEntity(userDoc as ProviderDocument);
                break;
            default:
                this.logger.error('Tried to access this route by an unidentified user.')
                throw new BadRequestException({
                    code: ErrorCodes.UNAUTHORIZED_ACCESS,
                    message: ErrorMessage.UNAUTHORIZED_ACCESS
                });
        }

        return user;
    }

    private async _getSubscription(subscriptionId: string): Promise<ISubscription> {
        const subscriptionDoc = await this._subscriptionRepository.findSubscriptionById(subscriptionId);
        if (!subscriptionDoc) {
            this.logger.error('Failed to get subscription after payment.')
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Subscription not found'
            });
        }

        return this._subscriptionMapper.toEntity(subscriptionDoc);
    }

    private async _settleBookingPayment(orderData: BookingOrderData, user: ITxUserDetails & { id: string }, verifyData: RazorpayVerifyData,): Promise<ITransaction | null> {
        const totalAmount = orderData.amount;
        const commissionRate = await this._adminSettingsRepository.getCustomerCommission();
        const gstRate = await this._adminSettingsRepository.getTax();

        // Back-calc baseAmount from total
        const divisor = 1 + (commissionRate / 100) + (gstRate / 100);
        const baseAmount = Math.round(totalAmount / divisor); // 19900 => (₹199.00)

        // Derive commission & GST from base
        const commission = Math.round(baseAmount * (commissionRate / 100));
        const gstAmount = Math.round(baseAmount * (gstRate / 100));

        // Provider’s share
        const providerAmount = baseAmount - commission;

        const customerTxDoc: TransactionDocument | null = await this._transactionRepository.createNewTransaction(
            orderData.bookingId,
            this._transactionMapper.toDocument({
                userId: user.id,
                transactionType: TransactionType.BOOKING_PAYMENT,
                direction: PaymentDirection.DEBIT,
                amount: totalAmount,
                currency: CurrencyType.INR,
                source: orderData.source,
                status: orderData.status,
                gateWayDetails: {
                    orderId: orderData.id,
                    paymentId: verifyData.razorpay_payment_id,
                    signature: verifyData.razorpay_signature,
                    receipt: orderData.receipt ?? null,
                },
                userDetails: { contact: user.contact, email: user.email, role: user.role },
                metadata: {
                    bookingId: orderData.bookingId,
                    breakup: { providerAmount, commission, gst: gstAmount }
                }
            }),
        );

        return customerTxDoc ? this._transactionMapper.toEntity(customerTxDoc) : null;
    }

    private async _settleSubscriptionPayment(userDetails: ITxUserDetails & { id: string }, subscription: ISubscription, orderData: SubscriptionOrderData, verifyData: RazorpayVerifyData): Promise<ITransaction | null> {
        const subscriptionTnx = await this._subscriptionRepository.createNewTransactionBySubscriptionId(
            subscription.id,
            this._transactionMapper.toDocument({
                userId: userDetails.id,
                transactionType: TransactionType.SUBSCRIPTION_PAYMENT,
                direction: PaymentDirection.CREDIT,
                source: orderData.source,
                status: TransactionStatus.SUCCESS,
                amount: orderData.amount,
                currency: CurrencyType.INR,
                gateWayDetails: {
                    orderId: verifyData.razorpay_order_id,
                    paymentId: verifyData.razorpay_payment_id,
                    signature: verifyData.razorpay_signature,
                    receipt: orderData.receipt ?? null
                },
                userDetails: {
                    contact: userDetails.contact,
                    email: userDetails.email,
                    role: userDetails.role
                },
                metadata: {
                    subscriptionId: subscription.id,
                    breakup: null,
                }
            })
        );

        return subscriptionTnx ? this._transactionMapper.toEntity(subscriptionTnx) : null;
    }

    private async _applyBookingPaymentWalletMovements(userId: string, role: UserType, orderData: BookingOrderData, transaction: ITransaction, verifyData: RazorpayVerifyData): Promise<void> {
        const adminWalletDoc = await this._walletRepository.getAdminWallet();

        if (!adminWalletDoc) {
            this.logger.error('Failed to get admin wallet.');
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }

        const adminWallet = this._walletMapper.toEntity(adminWalletDoc);
        const journalId = uuid();

        await this._walletLedgerRepository.create(
            this._walletLedgerMapper.toDocument({
                walletId: adminWallet.id,
                userId: adminWallet.userId,
                userRole: 'admin',
                direction: PaymentDirection.CREDIT,
                type: TransactionType.BOOKING_PAYMENT,
                amount: transaction.amount,
                currency: CurrencyType.INR,
                balanceBefore: adminWallet.balance,
                balanceAfter: adminWallet.balance + transaction.amount,
                journalId,
                bookingId: orderData.bookingId,
                bookingTransactionId: transaction.id,
                subscriptionId: null,
                subscriptionTransactionId: null,
                gatewayOrderId: orderData.id,
                gatewayPaymentId: verifyData.razorpay_payment_id,
                source: orderData.source,
                metadata: {
                    breakup: transaction.metadata?.breakup,
                },
            }),
        );

        const adminWalletUpdated = await this._walletRepository.updateAdminAmount(transaction.amount);

        if (!adminWalletUpdated) {
            this.logger.error('Failed to update admin wallet.');
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }

        if (orderData.source !== PaymentSource.WALLET) {
            return;
        }

        const userWalletDoc = await this._walletRepository.findWallet(userId);

        if (!userWalletDoc) {
            this.logger.error('Failed to get user wallet.');
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }

        const userWallet = this._walletMapper.toEntity(userWalletDoc);

        await this._walletLedgerRepository.create(
            this._walletLedgerMapper.toDocument({
                walletId: userWallet.id,
                userId: userWallet.userId,
                userRole: role,
                direction: PaymentDirection.DEBIT,
                type: orderData.transactionType,
                amount: transaction.amount,
                currency: CurrencyType.INR,
                balanceBefore: userWallet.balance,
                balanceAfter: userWallet.balance - transaction.amount,
                journalId,
                bookingId: orderData.bookingId,
                bookingTransactionId: transaction.id,
                subscriptionId: null,
                subscriptionTransactionId: null,
                gatewayOrderId: orderData.id,
                gatewayPaymentId: verifyData.razorpay_payment_id,
                source: orderData.source,
                metadata: {
                    breakup: transaction.metadata?.breakup,
                },
            }),
        );

        const userWalletUpdated = await this._walletRepository.updateUserAmount(
            userId,
            role,
            -transaction.amount,
        );

        if (!userWalletUpdated) {
            this.logger.error('Failed to update user wallet.');
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    private async _applySubscriptionPaymentWalletMovements(userId: string, role: UserType, orderData: SubscriptionOrderData, transaction: ITransaction, verifyData: RazorpayVerifyData): Promise<void> {
        const adminWalletDoc = await this._walletRepository.getAdminWallet();

        if (!adminWalletDoc) {
            this.logger.error('Failed to get admin wallet.');
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }

        const adminWallet = this._walletMapper.toEntity(adminWalletDoc);
        const journalId = uuid();

        // Admin Credit
        await this._walletLedgerRepository.create(
            this._walletLedgerMapper.toDocument({
                walletId: adminWallet.id,
                userId: adminWallet.userId,
                userRole: 'admin',
                direction: PaymentDirection.CREDIT,
                type: TransactionType.SUBSCRIPTION_PAYMENT,
                amount: transaction.amount,
                currency: CurrencyType.INR,
                balanceBefore: adminWallet.balance,
                balanceAfter: adminWallet.balance + transaction.amount,
                journalId,
                bookingId: null,
                bookingTransactionId: null,
                subscriptionId: orderData.subscriptionId,
                subscriptionTransactionId: transaction.id,
                gatewayOrderId: orderData.id,
                gatewayPaymentId: verifyData.razorpay_payment_id,
                source: orderData.source,
            }),
        );

        const adminWalletUpdated = await this._walletRepository.updateAdminAmount(transaction.amount);

        if (!adminWalletUpdated) {
            this.logger.error('Failed to update admin wallet.');
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }

        const userWalletDoc = await this._walletRepository.findWallet(userId);

        if (!userWalletDoc) {
            this.logger.error('Failed to get user wallet.');
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }

        const userWallet = this._walletMapper.toEntity(userWalletDoc);

        // User Debit
        await this._walletLedgerRepository.create(
            this._walletLedgerMapper.toDocument({
                walletId: userWallet.id,
                userId: userWallet.userId,
                userRole: role,
                direction: PaymentDirection.DEBIT,
                type: TransactionType.SUBSCRIPTION_PAYMENT,
                amount: transaction.amount,
                currency: CurrencyType.INR,
                balanceBefore: userWallet.balance,
                balanceAfter: userWallet.balance,
                journalId,
                bookingId: null,
                bookingTransactionId: null,
                subscriptionId: orderData.subscriptionId,
                subscriptionTransactionId: transaction.id,
                gatewayOrderId: orderData.id,
                gatewayPaymentId: verifyData.razorpay_payment_id,
                source: orderData.source,
            }),
        );
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

    async createOrder(userId: string, role: UserType, amount: number, currency: string = 'INR'): Promise<IRazorpayOrder> {
        return await this._paymentService.createOrder(amount, currency);
    }

    async handleBookingPayment(userId: string, role: ClientUserType, verifyData: RazorpayVerifyData, orderData: BookingOrderData): Promise<IVerifiedBookingsPayment> {
        const key = this._paymentLockingUtility.generatePaymentKey(userId, role);

        try {
            const user = await this._getUser(userId, role);

            const verified = this._paymentService.verifySignature(
                verifyData.razorpay_order_id,
                verifyData.razorpay_payment_id,
                verifyData.razorpay_signature,
            );

            if (!verified) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: ErrorMessage.PAYMENT_VERIFICATION_FAILED,
                });
            }

            let transaction: ITransaction | null = null;

            if (orderData.transactionType === TransactionType.BOOKING_PAYMENT) {
                transaction = await this._settleBookingPayment(
                    orderData,
                    {
                        contact: user.phone,
                        email: user.email,
                        id: user.id,
                        role,
                    },
                    verifyData,
                );
            }

            if (!transaction) {
                this.logger.error('Failed to create transaction for booking payment.');
                throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
            }

            await this._applyBookingPaymentWalletMovements(
                userId,
                role,
                orderData,
                transaction,
                verifyData,
            );

            const updatePaymentStatus = await this._bookingRepository.updatePaymentStatus(orderData.bookingId, PaymentStatus.PAID);
            if (!updatePaymentStatus) {
                this.logger.error('Failed to update payment status for booking payment.');
                throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
            }

            // Notify Customer
            await this._sendNotification(
                userId,
                NotificationTemplateId.PAYMENT_SUCCESS,
                NotificationType.EVENT,
                'Payment Success',
                `Your payment for booking #${orderData.bookingId.slice(-6)} has been verified.`,
                verifyData.razorpay_payment_id,
                { bookingId: orderData.bookingId, role }
            );

            const booking = await this._bookingRepository.findById(orderData.bookingId);
            if (booking) {
                await this._sendNotification(
                    booking.providerId.toString(),
                    NotificationTemplateId.ORDER_SUCCESS,
                    NotificationType.EVENT,
                    'New Order Received',
                    `You have received a new booking #${orderData.bookingId.slice(-6)}.`,
                    orderData.bookingId,
                    { bookingId: orderData.bookingId, role: 'provider' }
                );
            }

            return { verified, bookingId: orderData.bookingId, transaction };
        } catch (error) {
            throw error;
        } finally {
            await this._paymentLockingUtility.releaseLock(key);
        }
    }

    async handleSubscriptionPayment(userId: string, role: ClientUserType, verifyData: RazorpayVerifyData, orderData: SubscriptionOrderData): Promise<IVerifiedSubscriptionPayment> {
        const key = this._paymentLockingUtility.generatePaymentKey(userId, role);

        try {
            const [subscription, user] = await Promise.all([
                this._getSubscription(orderData.subscriptionId),
                this._getUser(userId, role)
            ]);

            const verified = this._paymentService.verifySignature(
                verifyData.razorpay_order_id,
                verifyData.razorpay_payment_id,
                verifyData.razorpay_signature
            );

            if (!verified) throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.PAYMENT_VERIFICATION_FAILED
            });

            const transaction = await this._settleSubscriptionPayment(
                { id: user.id, contact: user.phone, email: user.email, role },
                subscription,
                orderData,
                verifyData
            )


            if (!transaction) {
                this.logger.error('Subscription transaction document failed to create.');
                throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
            }

            await this._applySubscriptionPaymentWalletMovements(
                userId,
                role,
                orderData,
                transaction,
                verifyData
            );

            const updatePaymentStatus = await this._subscriptionRepository.updatePaymentStatus(orderData.subscriptionId, PaymentStatus.PAID);
            if (!updatePaymentStatus) {
                this.logger.error('Failed to update payment status for subscription payment.');
                throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
            }

            // Update user's subscription ID
            if (role === 'customer') {
                await this._customerRepository.updateSubscriptionId(userId, orderData.subscriptionId);
            } else if (role === 'provider') {
                await this._providerRepository.updateSubscriptionId(userId, orderData.subscriptionId);
            }

            // Notify User
            await this._sendNotification(
                userId,
                NotificationTemplateId.SUBSCRIPTION_SUCCESS,
                NotificationType.EVENT,
                'Subscription Success',
                `Your payment for subscription #${orderData.subscriptionId.slice(-6)} has been verified.`,
                verifyData.razorpay_payment_id,
                { subscriptionId: orderData.subscriptionId, role }
            );

            return { verified, subscriptionId: orderData.subscriptionId, transaction };
        } catch (error) {
            throw error;
        } finally {
            await this._paymentLockingUtility.releaseLock(key);
        }
    }

    async releasePaymentLock(userId: string, role: ClientUserType): Promise<void> {
        const key = this._paymentLockingUtility.generatePaymentKey(userId, role);
        await this._paymentLockingUtility.releaseLock(key);
    }
}
