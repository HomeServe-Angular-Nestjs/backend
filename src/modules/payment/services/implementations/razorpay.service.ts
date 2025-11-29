import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ADMIN_SETTINGS_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SUBSCRIPTION_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { CUSTOMER_MAPPER, PROVIDER_MAPPER, SUBSCRIPTION_MAPPER, TRANSACTION_MAPPER } from '@core/constants/mappers.constant';
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
import { PaymentDirection, TransactionStatus, TransactionType } from '@core/enum/transaction.enum';
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
                this.logger.error('Tried to access this route by an unidentified user type.')
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Invalid user type.'
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

    private async _settleBookingPayment(orderData: BookingOrderData, user: ITxUserDetails & { id: string }, verifyData: RazorpayVerifyData,): Promise<ITransaction> {
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

        const customerTxDoc = await this._transactionRepository.create(
            this._transactionMapper.toDocument({
                userId: user.id,
                transactionType: TransactionType.BOOKING,
                direction: PaymentDirection.DEBIT,
                amount: totalAmount,
                currency: 'INR',
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
            })
        );

        return this._transactionMapper.toEntity(customerTxDoc);
    }

    private async _settleSubscriptionPayment(userDetails: ITxUserDetails & { id: string }, subscription: ISubscription, orderData: SubscriptionOrderData, verifyData: RazorpayVerifyData): Promise<ITransaction> {
        const subscriptionTnx = await this._transactionRepository.create(
            this._transactionMapper.toDocument({
                userId: userDetails.id,
                transactionType: TransactionType.SUBSCRIPTION,
                direction: PaymentDirection.CREDIT,
                source: orderData.source,
                status: TransactionStatus.SUCCESS,
                amount: orderData.amount,
                currency: 'INR',
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

        return this._transactionMapper.toEntity(subscriptionTnx);
    }

    async createOrder(userId: string, role: UserType, amount: number, currency: string = 'INR'): Promise<IRazorpayOrder> {
        const key = this._paymentLockingUtility.generatePaymentKey(userId, role);

        const acquired = await this._paymentLockingUtility.acquireLock(key, 300);
        if (!acquired) {
            const ttl = await this._paymentLockingUtility.getTTL(key);

            throw new ForbiddenException({
                code: ErrorCodes.PAYMENT_IN_PROGRESS,
                message: `We are still processing your previous payment. Please try again in ${ttl} seconds.`,
                ttl
            });
        }

        return await this._paymentService.createOrder(amount, currency);
    }

    async handleBookingPayment(userId: string, role: ClientUserType, verifyData: RazorpayVerifyData, orderData: BookingOrderData): Promise<IVerifiedBookingsPayment> {
        const key = this._paymentLockingUtility.generatePaymentKey(userId, role);
        try {
            const user = await this._getUser(userId, role);

            const verified = this._paymentService.verifySignature(
                verifyData.razorpay_order_id,
                verifyData.razorpay_payment_id,
                verifyData.razorpay_signature
            );

            if (!verified) throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.PAYMENT_VERIFICATION_FAILED
            });

            let transaction: ITransaction | null = null;
            if (orderData.transactionType === TransactionType.BOOKING) {
                transaction = await this._settleBookingPayment(orderData, {
                    contact: user.phone,
                    email: user.email,
                    id: user.id,
                    role
                }, verifyData);
            }

            if (!transaction) {
                this.logger.error('Transaction could not be created.');
                throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR)
            }

            await this._walletRepository.bulkUpdate(transaction);
            return { verified, bookingId: orderData.bookingId, transaction };
        } finally {
            await this._paymentLockingUtility.releaseLock(key);
        }
    }

    async handleSubscriptionPayment(userId: string, role: ClientUserType, verifyData: RazorpayVerifyData, orderData: SubscriptionOrderData): Promise<IVerifiedSubscriptionPayment> {
        const key = this._paymentLockingUtility.generatePaymentKey(userId, role);
        try {
            const verified = this._paymentService.verifySignature(
                verifyData.razorpay_order_id,
                verifyData.razorpay_payment_id,
                verifyData.razorpay_signature
            );

            if (!verified) throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.PAYMENT_VERIFICATION_FAILED
            });

            const user = await this._getUser(userId, role);
            const subscription = await this._getSubscription(orderData.subscriptionId);

            let transaction: ITransaction | null = null;
            if (orderData.transactionType === TransactionType.SUBSCRIPTION) {
                transaction = await this._settleSubscriptionPayment(
                    { id: user.id, contact: user.phone, email: user.email, role },
                    subscription,
                    orderData,
                    verifyData
                );
            }

            if (!transaction) {
                this.logger.error('Transaction could not be created.');
                throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR)
            }

            await this._walletRepository.bulkUpdate(transaction);
            return { verified, subscriptionId: subscription.id, transaction };
        } finally {
            await this._paymentLockingUtility.releaseLock(key);
        }
    }
}
