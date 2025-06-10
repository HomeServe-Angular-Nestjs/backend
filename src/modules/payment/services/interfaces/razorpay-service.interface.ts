import { RazorpayOrder } from "src/core/utilities/interface/razorpay.utility.interface";

export interface IRazorPaymentService {
    createOrder(amount: number, currency?: string): Promise<RazorpayOrder>;
    verifySignature(orderId: string, paymentId: string, signature: string): boolean;
}