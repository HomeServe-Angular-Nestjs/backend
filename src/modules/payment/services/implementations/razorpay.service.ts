import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ADMIN_SETTINGS_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, TRANSACTION_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { CUSTOMER_MAPPER, PROVIDER_MAPPER, TRANSACTION_MAPPER } from '@core/constants/mappers.constant';
import { PAYMENT_UTILITY_NAME } from '@core/constants/utility.constant';
import { ITransactionMapper } from '@core/dto-mapper/interface/transaction.mapper.interface';
import { IRazorpayOrder, ITransaction, IVerifiedBookingsPayment } from '@core/entities/interfaces/transaction.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { IPaymentGateway } from '@core/utilities/interface/razorpay.utility.interface';
import { RazorpayVerifyData, VerifyOrderData } from '@modules/payment/dtos/payment.dto';
import { IRazorPaymentService } from '@modules/payment/services/interfaces/razorpay-service.interface';
import { PaymentDirection, TransactionType } from '@core/enum/transaction.enum';
import { IWalletRepository } from '@core/repositories/interfaces/wallet-repo.interface';
import { ErrorCodes } from '@core/enum/error.enum';
import { IAdminSettingsRepository } from '@core/repositories/interfaces/admin-settings-repo.interface';
import { ICustomer, IProvider } from '@core/entities/interfaces/user.entity.interface';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';
import { CustomerDocument } from '@core/schema/customer.schema';
import { ProviderDocument } from '@core/schema/provider.schema';

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
    ) {
        this.logger = this._loggerFactory.createLogger(RazorPaymentService.name);
    }

    async createOrder(amount: number, currency: string = 'INR'): Promise<IRazorpayOrder> {
        return await this._paymentService.createOrder(amount, currency);
    }

    private async _settleBookingPayment(orderData: VerifyOrderData, user: ICustomer | IProvider, verifyData: RazorpayVerifyData,): Promise<ITransaction> {
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
                userDetails: { contact: user.phone, email: user.email },
                metadata: {
                    bookingId: orderData.bookingId,
                    breakup: { providerAmount, commission, gst: gstAmount }
                }
            })
        );

        // const adminCommissionTx = await this._transactionRepository.create(
        //     this._transactionMapper.toDocument({
        //         userId: 'adminId',
        //         status: orderData.status,
        //         transactionType: TransactionType.COMMISSION,
        //         direction: PaymentDirection.CREDIT,
        //         amount: commission,
        //         source: orderData.source,
        //         currency: 'INR',
        //         gateWayDetails: null,
        //         userDetails: null,
        //         metadata: { bookingId, breakup: { gst: gstAmount } }
        //     })
        // );
        // transactions.push(this._transactionMapper.toEntity(adminCommissionTx));

        // const providerTx = await this._transactionRepository.create(
        //     this._transactionMapper.toDocument({
        //         userId: 'providerId',
        //         status: orderData.status,
        //         transactionType: TransactionType.BOOKING_RELEASE,
        //         direction: PaymentDirection.CREDIT,
        //         amount: providerAmount,
        //         gateWayDetails: null,
        //         userDetails: null,
        //         source: orderData.source,
        //         currency: 'INR',
        //         metadata: { bookingId }
        //     })
        // );
        // transactions.push(this._transactionMapper.toEntity(providerTx));
        return this._transactionMapper.toEntity(customerTxDoc);
    }

    // private async updateWallets(transactions: ITransaction[]): Promise<void> {
    //     for (const tx of transactions) {
    //         if (tx.status !== TransactionStatus.SUCCESS) continue; 

    //         switch (tx.transactionType) {
    //             case TransactionType.BOOKING: {
    //                 // Customer paid -> Admin wallet gets credited
    //                 await this._walletRepository.updateAdminAmount(tx.amount);
    //                 break;
    //             }

    //             case TransactionType.CUSTOMER_COMMISSION: {
    //                 // Commission from customer -> stays in Admin wallet
    //                 await this._walletRepository.updateAdminAmount(tx.amount);
    //                 break;
    //             }

    //             case TransactionType.PROVIDER_COMMISSION: {
    //                 // Commission from provider -> stays in Admin wallet
    //                 await this._walletRepository.updateAdminAmount(tx.amount);
    //                 break;
    //             }

    //             case TransactionType.BOOKING_RELEASE: {
    //                 // Provider payout -> Admin wallet decreases, Provider wallet increases
    //                 await this._walletRepository.updateAdminAmount(-tx.amount);
    //                 await this._walletRepository.updateProviderBalance(tx.userId, tx.amount);
    //                 break;
    //             }

    //             case TransactionType.REFUND: {
    //                 // Refund to customer -> Admin wallet decreases
    //                 await this._walletRepository.updateAdminAmount(-tx.amount);
    //                 await this._walletRepository.updateCustomerBalance(tx.userId, tx.amount);
    //                 break;
    //             }

    //             default:
    //                 this.logger.warn(`Unhandled transaction type: ${tx.transactionType}`);
    //         }
    //     }
    // }

    async handleBookingPayment(userId: string, role: string, verifyData: RazorpayVerifyData, orderData: VerifyOrderData): Promise<IVerifiedBookingsPayment> {
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

        const verified = this._paymentService.verifySignature(
            verifyData.razorpay_order_id,
            verifyData.razorpay_payment_id,
            verifyData.razorpay_signature
        );

        if (!verified) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: 'Payment verification failed'
        });

        let transaction: ITransaction | null = null;
        if (orderData.transactionType === TransactionType.BOOKING) {
            transaction = await this._settleBookingPayment(orderData, user, verifyData);
        }

        if (!transaction) {
            throw new InternalServerErrorException('Transaction could not be created.');
        }

        await this._walletRepository.bulkUpdate(transaction);
        return { verified, bookingId: orderData.bookingId, transaction };
    }
}
