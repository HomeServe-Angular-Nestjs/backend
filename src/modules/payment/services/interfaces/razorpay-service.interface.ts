import { IRazorpayOrder, IVerifiedPayment } from "src/core/entities/interfaces/transaction.entity.interface";
import { RazorpayVerifyData, VerifyOrderData } from "../../dtos/payment.dto";

export interface IRazorPaymentService {
    createOrder(amount: number, currency?: string): Promise<IRazorpayOrder>;
    verifySignature(userId: string, role: string, verifyData: RazorpayVerifyData, orderData: VerifyOrderData): Promise<IVerifiedPayment>;
}