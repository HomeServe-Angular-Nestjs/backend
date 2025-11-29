import { Request } from 'express';

import { RAZORPAYMENT_SERVICE_NAME } from '@core/constants/service.constant';
import { IRazorpayOrder, IVerifiedBookingsPayment } from '@core/entities/interfaces/transaction.entity.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IPayload } from '@core/misc/payload.interface';
import { CreateOrderDto, BookingPaymentVerifyDto, SubscriptionPaymentVerifyDto } from '@modules/payment/dtos/payment.dto';
import { IRazorPaymentService } from '@modules/payment/services/interfaces/razorpay-service.interface';
import { BadRequestException, Body, Controller, Inject, InternalServerErrorException, Post, Req, UnauthorizedException, UseGuards, } from '@nestjs/common';
import { OngoingPaymentGuard } from '@core/guards/ongoing-payment.guard';
import { ClientUserType } from '@core/entities/interfaces/user.entity.interface';

@Controller('payment')
export class RazorpayController {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(RAZORPAYMENT_SERVICE_NAME)
        private readonly _paymentService: IRazorPaymentService
    ) {
        this.logger = this._loggerFactory.createLogger(RazorpayController.name);
    }

    private _getUser(req: Request): IPayload {
        return req.user as IPayload;
    }

    @UseGuards(OngoingPaymentGuard)
    @Post('create_order')
    async createOrder(@Req() req: Request, @Body() { amount }: CreateOrderDto): Promise<IRazorpayOrder> {
        try {
            const user = this._getUser(req);
            const numericAmount = Number(amount);

            if (isNaN(numericAmount) || numericAmount <= 0) {
                throw new BadRequestException('Invalid amount: must be a positive number');
            }

            return this._paymentService.createOrder(user.sub, user.type as ClientUserType, numericAmount);
        } catch (err) {
            this.logger.error(`Error making the payment: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('verify_booking')
    async handleBookingPaymentVerification(@Req() req: Request, @Body() bookingPaymentVerifyDto: BookingPaymentVerifyDto) {
        const user = req.user as IPayload;

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = bookingPaymentVerifyDto.verifyData;

        if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every(v => v?.trim())) {
            this.logger.warn(`Missing payment fields: orderId=${razorpay_order_id}, paymentId=${razorpay_payment_id}`);
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.PAYMENT_VERIFICATION_FAILED
            });
        }

        return await this._paymentService.handleBookingPayment(user.sub, user.type as ClientUserType, bookingPaymentVerifyDto.verifyData, bookingPaymentVerifyDto.orderData);
    }

    @Post('verify_subscription')
    async handleSubscriptionPaymentVerification(@Req() req: Request, @Body() subscriptionPaymentDto: SubscriptionPaymentVerifyDto) {
        const user = req.user as IPayload;

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = subscriptionPaymentDto.verifyData;

        if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every(v => v?.trim())) {
            this.logger.warn(`Missing payment fields: orderId=${razorpay_order_id}, paymentId=${razorpay_payment_id}`);
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.PAYMENT_VERIFICATION_FAILED
            });
        }

        return await this._paymentService.handleSubscriptionPayment(user.sub, user.type as ClientUserType, subscriptionPaymentDto.verifyData, subscriptionPaymentDto.orderData);
    }
}
