import { PAYMENT_LOCKING_UTILITY_NAME, PAYMENT_UTILITY_NAME } from '@core/constants/utility.constant';
import { PaymentLockingUtility } from '@core/utilities/implementations/payment-locking.utility';
import { RazorpayUtility } from '@core/utilities/implementations/razorpay.utils';
import { Provider } from '@nestjs/common';

export const paymentUtilityProviders: Provider[] = [
    {
        provide: PAYMENT_UTILITY_NAME,
        useClass: RazorpayUtility
    },
    {
        provide: PAYMENT_LOCKING_UTILITY_NAME,
        useClass: PaymentLockingUtility
    }
]