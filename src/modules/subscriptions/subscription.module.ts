import { Module } from "@nestjs/common";
import { SubscriptionController } from "./controllers/subscription.controller";
import { subscriptionServiceProviders } from "./providers/service.providers";
import { subscriptionRepositoryProviders } from "./providers/repository.providers";

@Module({
    imports: [],
    controllers: [SubscriptionController],
    providers: [
        ...subscriptionServiceProviders,
        ...subscriptionRepositoryProviders,
        
    ]
})
export class SubscriptionModules { }