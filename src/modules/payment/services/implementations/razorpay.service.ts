import { IPaymentGateway, RazorpayOrder } from "src/core/utilities/interface/razorpay.utility.interface";
import { IRazorPaymentService } from "../interfaces/razorpay-service.interface";
import { Inject, Injectable } from "@nestjs/common";
import { PAYMENT_UTILITY_NAME } from "src/core/constants/utility.constant";

@Injectable()
export class RazorPaymentService implements IRazorPaymentService {

    constructor(
        @Inject(PAYMENT_UTILITY_NAME)
        private readonly _paymentService: IPaymentGateway
    ) { }

    async createOrder(amount: number, currency: string = 'INR'): Promise<RazorpayOrder> {
        return await this._paymentService.createOrder(amount, currency);
    }

    verifySignature(orderId: string, paymentId: string, signature: string): boolean {
        return this._paymentService.verifySignature(orderId, paymentId, signature);
    }
}