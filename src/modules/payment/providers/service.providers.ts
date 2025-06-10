import { Provider } from "@nestjs/common";
import { RAZORPAYMENT_SERVICE_NAME, TOKEN_SERVICE_NAME } from "src/core/constants/service.constant";
import { TokenService } from "src/modules/auth/services/implementations/token.service";
import { RazorPaymentService } from "../services/implementations/razorpay.service";

export const paymentServiceProviders: Provider[] = [
    {
        provide: TOKEN_SERVICE_NAME,
        useClass: TokenService
    },
    {
        provide: RAZORPAYMENT_SERVICE_NAME,
        useClass: RazorPaymentService
    }
]