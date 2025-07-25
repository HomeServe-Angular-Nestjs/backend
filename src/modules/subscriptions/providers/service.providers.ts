import { SUBSCRIPTION_SERVICE_NAME } from '@core/constants/service.constant';
import {
    SubscriptionService
} from '@modules/subscriptions/services/implementation/subscription.service';
import { Provider } from '@nestjs/common';

export const subscriptionServiceProviders: Provider[] = [
    {
        provide: SUBSCRIPTION_SERVICE_NAME,
        useClass: SubscriptionService
    }
];