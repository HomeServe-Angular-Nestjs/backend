import { Provider } from "@nestjs/common";
import { PAYMENT_UTILITY_NAME } from "src/core/constants/utility.constant";
import { RazorpayUtility } from "src/core/utilities/implementations/razorpay.utils";

export const paymentUtilityProviders: Provider[] = [
    {
        provide: PAYMENT_UTILITY_NAME,
        useClass: RazorpayUtility
    }
]