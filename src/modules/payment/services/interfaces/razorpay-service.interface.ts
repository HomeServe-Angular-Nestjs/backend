import { IRazorpayOrder, IVerifiedBookingsPayment, IVerifiedSubscriptionPayment } from '@core/entities/interfaces/transaction.entity.interface';
import { BookingOrderData, RazorpayVerifyData, SubscriptionOrderData } from '@modules/payment/dtos/payment.dto';

export interface IRazorPaymentService {
    createOrder(amount: number, currency?: string): Promise<IRazorpayOrder>;
    handleBookingPayment(userId: string, role: string, verifyData: RazorpayVerifyData, orderData: BookingOrderData): Promise<IVerifiedBookingsPayment>;
    handleSubscriptionPayment(userId: string, role: string, verifyData: RazorpayVerifyData, orderData: SubscriptionOrderData): Promise<IVerifiedSubscriptionPayment>
}