import { BadRequestException, Body, Controller, Inject, InternalServerErrorException, Logger, NotFoundException, Post, Req, UseInterceptors } from "@nestjs/common";

import { CreateOrderDto, RazorpayVerifyDto } from "../dtos/payment.dto";
import { RAZORPAYMENT_SERVICE_NAME } from "src/core/constants/service.constant";
import { IRazorPaymentService } from "../services/interfaces/razorpay-service.interface";
import { IRazorpayOrder, IVerifiedPayment } from "src/core/entities/interfaces/transaction.entity.interface";
import { IPayload } from "src/core/misc/payload.interface";
import { Request } from "express";

@Controller('payment')
//@UseInterceptors()
export class RazorpayController {
    private readonly logger = new Logger(RazorpayController.name);

    constructor(
        @Inject(RAZORPAYMENT_SERVICE_NAME)
        private readonly _paymentService: IRazorPaymentService
    ) { }

    @Post('create_order')
    async createOrder(@Body() { amount }: CreateOrderDto): Promise<IRazorpayOrder> {
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
    async verifySignature(@Req() req: Request, @Body() dto: RazorpayVerifyDto): Promise<IVerifiedPayment> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new NotFoundException('user not found');
            }

            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = dto.verifyData;

            if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every(v => v?.trim())) {
                this.logger.warn(`Missing payment fields: orderId=${razorpay_order_id}, paymentId=${razorpay_payment_id}`);
                throw new BadRequestException('Missing or invalid payment verification fields.');
            }

            return await this._paymentService.verifySignature(user.sub, dto.role, dto.verifyData, dto.orderData);
        } catch (err) {
            this.logger.error(`Error verifying the payment: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Payment verification failed');
        }
    }
}
