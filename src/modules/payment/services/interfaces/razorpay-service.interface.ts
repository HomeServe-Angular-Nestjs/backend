import {
    IRazorpayOrder, IVerifiedPayment
} from '@core/entities/interfaces/transaction.entity.interface';
import { RazorpayVerifyData, VerifyOrderData } from '@modules/payment/dtos/payment.dto';

export interface IRazorPaymentService {
    createOrder(amount: number, currency?: string): Promise<IRazorpayOrder>;
    verifySignature(userId: string, role: string, verifyData: RazorpayVerifyData, orderData: VerifyOrderData): Promise<IVerifiedPayment>;
}