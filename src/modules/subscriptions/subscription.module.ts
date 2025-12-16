import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { SubscriptionController } from './controllers/subscription.controller';
import { subscriptionRepositoryProviders } from './providers/repository.providers';
import { subscriptionServiceProviders } from './providers/service.providers';
import { subscriptionUtilityProviders } from '@modules/subscriptions/providers/utility.providers';

@Module({
    imports: [SharedModule],
    controllers: [SubscriptionController],
    providers: [
        ...subscriptionServiceProviders,
        ...subscriptionRepositoryProviders,
        ...subscriptionUtilityProviders,
    ]
})
export class SubscriptionModules { }