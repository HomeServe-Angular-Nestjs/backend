import { PAYMENT_SERVICE_NAME, TOKEN_SERVICE_NAME } from '@core/constants/service.constant';
import { TokenService } from '@modules/auth/services/implementations/token.service';
import { RazorPaymentService } from '@modules/payment/services/implementations/razorpay.service';
import { Provider } from '@nestjs/common';

export const paymentServiceProviders: Provider[] = [
    {
        provide: TOKEN_SERVICE_NAME,
        useClass: TokenService
    },
    {
        provide: PAYMENT_SERVICE_NAME,
        useClass: RazorPaymentService
    },
    
]