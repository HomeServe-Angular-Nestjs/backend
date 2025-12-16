import { PAYMENT_LOCKING_UTILITY_NAME } from "@core/constants/utility.constant";
import { PaymentLockingUtility } from "@core/utilities/implementations/payment-locking.utility";
import { Provider } from "@nestjs/common";

export const subscriptionUtilityProviders: Provider[] = [
    {
        provide: PAYMENT_LOCKING_UTILITY_NAME,
        useClass: PaymentLockingUtility
    }
]