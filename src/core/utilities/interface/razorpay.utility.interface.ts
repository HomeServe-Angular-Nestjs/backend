import { IRazorpayOrder } from '@core/entities/interfaces/transaction.entity.interface';

export interface IPaymentGateway {
    createOrder(amount: number, currency?: string): Promise<IRazorpayOrder>;
    verifySignature(orderId: string, paymentId: string, signature: string): boolean;
}