import type {
  IRazorpayOrder,
  IVerifiedBookingsPayment,
  IVerifiedSubscriptionPayment,
} from '@core/entities/interfaces/transaction.entity.interface';
import type { ClientUserType } from '@core/entities/interfaces/user.entity.interface';
import { UserType } from '@core/entities/interfaces/user.entity.interface';
import type { BookingOrderData, RazorpayVerifyData, SubscriptionOrderData } from '@modules/payment/dtos/payment.dto';

export interface IRazorPaymentService {
  createOrder(userId: string, role: ClientUserType, amount: number, currency?: string): Promise<IRazorpayOrder>;
  handleBookingPayment(
    userId: string,
    role: ClientUserType,
    verifyData: RazorpayVerifyData,
    orderData: BookingOrderData,
  ): Promise<IVerifiedBookingsPayment>;
  handleSubscriptionPayment(
    userId: string,
    role: ClientUserType,
    verifyData: RazorpayVerifyData,
    orderData: SubscriptionOrderData,
  ): Promise<IVerifiedSubscriptionPayment>;
  releasePaymentLock(userId: string, role: ClientUserType): Promise<void>;
}
