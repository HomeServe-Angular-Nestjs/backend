import { Provider } from "@nestjs/common";
import { SUBSCRIPTION_SERVICE_NAME } from "src/core/constants/service.constant";
import { SubscriptionService } from "../services/implementation/subscription.service";

export const subscriptionServiceProviders: Provider[] = [
    {
        provide: SUBSCRIPTION_SERVICE_NAME,
        useClass: SubscriptionService
    }
];