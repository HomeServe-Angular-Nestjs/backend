import { PAYMENT_UTILITY_NAME } from '@core/constants/utility.constant';
import { RazorpayUtility } from '@core/utilities/implementations/razorpay.utils';
import { Provider } from '@nestjs/common';

export const paymentUtilityProviders: Provider[] = [
    {
        provide: PAYMENT_UTILITY_NAME,
        useClass: RazorpayUtility
    }
]