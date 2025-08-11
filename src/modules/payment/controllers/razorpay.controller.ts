import { Request } from 'express';

import { RAZORPAYMENT_SERVICE_NAME } from '@core/constants/service.constant';
import {
    IRazorpayOrder, IVerifiedPayment
} from '@core/entities/interfaces/transaction.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IPayload } from '@core/misc/payload.interface';
import { CreateOrderDto, RazorpayVerifyDto } from '@modules/payment/dtos/payment.dto';
import {
    IRazorPaymentService
} from '@modules/payment/services/interfaces/razorpay-service.interface';
import {
    BadRequestException, Body, Controller, Inject, InternalServerErrorException, Post, Req,
    UnauthorizedException,
    UseGuards
} from '@nestjs/common';
import { IsPaymentInitializedGuard } from '@modules/payment/guards/is_payment_initialized.guard';


@Controller('payment')
export class RazorpayController {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(RAZORPAYMENT_SERVICE_NAME)
        private readonly _paymentService: IRazorPaymentService
    ) {
        this.logger = this.loggerFactory.createLogger(RazorpayController.name);
    }

    @Post('create_order')
    @UseGuards(IsPaymentInitializedGuard)
    async createOrder(@Body() { amount }: CreateOrderDto): Promise<IRazorpayOrder> {
        try {
            const numericAmount = Number(amount);

            if (isNaN(numericAmount) || numericAmount <= 0) {
                throw new BadRequestException('Invalid amount: must be a positive number');
            }

            return this._paymentService.createOrder(numericAmount);
        } catch (err) {
            this.logger.error(`Error making the payment: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('verify_signature')
    async verifySignature(@Req() req: Request, @Body() dto: RazorpayVerifyDto): Promise<IVerifiedPayment> {
        try {
            const user = req.user as IPayload;
            if (!user.sub || !user.type) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = dto.verifyData;

            if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every(v => v?.trim())) {
                this.logger.warn(`Missing payment fields: orderId=${razorpay_order_id}, paymentId=${razorpay_payment_id}`);
                throw new BadRequestException('Missing or invalid payment verification fields.');
            }

            return await this._paymentService.verifySignature(user.sub, user.type || dto.role, dto.verifyData, dto.orderData);
        } catch (err) {
            this.logger.error(`Error verifying the payment: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }
}
