import { BadRequestException, Body, Controller, Inject, InternalServerErrorException, Logger, Post, UseInterceptors } from "@nestjs/common";
import { AuthInterceptor } from "src/modules/auth/interceptors/auth.interceptor";
import { CreateOrderDto, RazorpayVerifyDto } from "../dtos/payment.dto";
import { RAZORPAYMENT_SERVICE_NAME } from "src/core/constants/service.constant";
import { IRazorPaymentService } from "../services/interfaces/razorpay-service.interface";

@Controller('payment')
@UseInterceptors(AuthInterceptor)
export class RazorpayController {
    private readonly logger = new Logger(RazorpayController.name);

    constructor(
        @Inject(RAZORPAYMENT_SERVICE_NAME)
        private readonly _paymentService: IRazorPaymentService
    ) { }

    @Post('create_order')
    async createOrder(@Body() { amount }: CreateOrderDto) {
        try {
            const numericAmount = Number(amount);

            if (isNaN(numericAmount) || numericAmount <= 0) {
                throw new BadRequestException('Invalid amount: must be a positive number');
            }

            return this._paymentService.createOrder(numericAmount);
        } catch (err) {
            this.logger.error(`Error making the payment: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Payment failed');
        }
    }

    @Post('verify_signature')
    async verifySignature(@Body() payload: RazorpayVerifyDto) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload || {};

            if (!razorpay_order_id?.trim() || !razorpay_payment_id?.trim() || !razorpay_signature?.trim()) {
                this.logger.warn('Invalid or missing payment fields in payload', payload);
                throw new BadRequestException('Missing or invalid payment verification fields.');
            }

            return this._paymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        } catch (err) {
            this.logger.error(`Error verifying the payment: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Payment verification failed');
        }
    }
}
