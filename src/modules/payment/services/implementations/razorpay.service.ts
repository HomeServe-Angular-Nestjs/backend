import { IPaymentGateway } from "src/core/utilities/interface/razorpay.utility.interface";
import { IRazorPaymentService } from "../interfaces/razorpay-service.interface";
import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { PAYMENT_UTILITY_NAME } from "src/core/constants/utility.constant";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, TRANSACTION_REPOSITORY_NAME } from "src/core/constants/repository.constant";
import { ITransactionRepository } from "src/core/repositories/interfaces/transaction-repo.interface";
import { IRazorpayOrder, IVerifiedPayment } from "src/core/entities/interfaces/transaction.entity.interface";
import { RazorpayVerifyData, VerifyOrderData } from "../../dtos/payment.dto";
import { ICustomerRepository } from "src/core/repositories/interfaces/customer-repo.interface";
import { IProviderRepository } from "src/core/repositories/interfaces/provider-repo.interface";
import { TransactionType } from "src/core/enum/transaction.enum";
import { CustomLogger } from "src/core/logger/custom-logger";

@Injectable()
export class RazorPaymentService implements IRazorPaymentService {
    private readonly logger = new CustomLogger(RazorPaymentService.name);

    constructor(
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
