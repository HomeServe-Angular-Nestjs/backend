import { IRazorpayOrder, IVerifiedBookingsPayment, IVerifiedSubscriptionPayment } from '@core/entities/interfaces/transaction.entity.interface';
import { ClientUserType, UserType } from '@core/entities/interfaces/user.entity.interface';
import { BookingOrderData, RazorpayVerifyData, SubscriptionOrderData } from '@modules/payment/dtos/payment.dto';

export interface IRazorPaymentService {
    createOrder(userId: string, role: ClientUserType, amount: number, currency?: string): Promise<IRazorpayOrder>;
    handleBookingPayment(userId: string, role: ClientUserType, verifyData: RazorpayVerifyData, orderData: BookingOrderData): Promise<IVerifiedBookingsPayment>;
    handleSubscriptionPayment(userId: string, role: ClientUserType, verifyData: RazorpayVerifyData, orderData: SubscriptionOrderData): Promise<IVerifiedSubscriptionPayment>;
    releasePaymentLock(userId: string, role: ClientUserType): Promise<void>;
}