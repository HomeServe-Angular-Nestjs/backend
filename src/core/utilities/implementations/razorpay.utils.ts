import { Injectable } from "@nestjs/common";
import Razorpay from 'razorpay';
import { IPaymentGateway } from "../interface/razorpay.utility.interface";
import { ConfigService } from "@nestjs/config";
import * as crypto from 'crypto';
import { IRazorpayOrder } from "src/core/entities/interfaces/transaction.entity.interface";

@Injectable()
export class RazorpayUtility implements IPaymentGateway {
    private _razorpay: Razorpay;
    private readonly _secret: string;

    constructor(private _config: ConfigService) {
        this._secret = this._config.get<string>('RAZORPAY_KEY_SECRET') || '';
        this._razorpay = new Razorpay({
            key_id: this._config.get('RAZORPAY_KEY_ID'),
            key_secret: this._secret
        });
    }

    async createOrder(amount: number, currency: string = 'INR'): Promise<IRazorpayOrder> {
        const options = {
            amount: amount * 100,
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1
        }

        return this._razorpay.orders.create(options) as Promise<IRazorpayOrder>;
    }

    verifySignature(orderId: string, paymentId: string, signature: string): boolean {
        const body = `${orderId}|${paymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', this._secret)
            .update(body)
            .digest('hex');

        return expectedSignature === signature;
    }
}