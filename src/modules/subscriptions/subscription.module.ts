import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { SubscriptionController } from './controllers/subscription.controller';
import { subscriptionRepositoryProviders } from './providers/repository.providers';
import { subscriptionServiceProviders } from './providers/service.providers';

@Module({
    imports: [SharedModule],
    controllers: [SubscriptionController],
    providers: [
        ...subscriptionServiceProviders,
        ...subscriptionRepositoryProviders,

    ]
})
export class SubscriptionModules { }