import {
    CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME,
    TRANSACTION_REPOSITORY_NAME
} from '@core/constants/repository.constant';
import { PAYMENT_UTILITY_NAME } from '@core/constants/utility.constant';
import {
    IRazorpayOrder, IVerifiedPayment
} from '@core/entities/interfaces/transaction.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { IPaymentGateway } from '@core/utilities/interface/razorpay.utility.interface';
import { RazorpayVerifyData, VerifyOrderData } from '@modules/payment/dtos/payment.dto';
import {
    IRazorPaymentService
} from '@modules/payment/services/interfaces/razorpay-service.interface';
import {
    BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException
} from '@nestjs/common';

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
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository
    ) { }

    async createOrder(amount: number, currency: string = 'INR'): Promise<IRazorpayOrder> {
        return await this._paymentService.createOrder(amount, currency);
    }

    async verifySignature(userId: string, role: string, verifyData: RazorpayVerifyData, orderData: VerifyOrderData): Promise<IVerifiedPayment> {
        const repo = role === 'customer' ? this._customerRepository : this._providerRepository;
        if (!repo) {
            throw new BadRequestException(`Invalid role provided: ${role}`);
        }

        const user = await repo.findById(userId);
        if (!user) {
            throw new NotFoundException(`${role} with ID ${userId} not found.`);
        }

        const verified = this._paymentService.verifySignature(
            verifyData.razorpay_order_id,
            verifyData.razorpay_payment_id,
            verifyData.razorpay_signature
        );

        try {
            const transaction = await this._transactionRepository.create({
                orderId: orderData.id,
                paymentId: verifyData.razorpay_payment_id,
                signature: verifyData.razorpay_signature,
                amount: orderData.amount,
                contact: user.phone,
                currency: orderData.currency,
                email: user.email,
                status: orderData.status,
                userId: user.id,
                method: orderData.method,
                receipt: orderData.receipt,
                transactionType: orderData.transactionType,
            });

            return { verified, transaction };

        } catch (error) {
            this.logger.error(`Transaction creation failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to create transaction.');
        }
    }
}
