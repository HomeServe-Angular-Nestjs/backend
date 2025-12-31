import {
    ADMIN_MAPPER, ADMIN_SETTINGS_MAPPER, AVAILABILITY_MAPPER, BOOKING_MAPPER, CART_MAPPER, CHAT_MAPPER, CUSTOMER_MAPPER, MESSAGE_MAPPER,
    NOTIFICATION_MAPPER, PLAN_MAPPER, PROFESSION_MAPPER, PROVIDER_MAPPER, PROVIDER_SERVICE_MAPPER, REPORT_MAPPER, RESERVATION_MAPPER,
    SCHEDULES_MAPPER, SERVICE_CATEGORY_MAPPER, SERVICE_OFFERED_MAPPER, SLOT_RULE_MAPPER, SUBSCRIPTION_MAPPER,
    TRANSACTION_MAPPER, WALLET_LEDGER_MAPPER, WALLET_MAPPER
} from '@core/constants/mappers.constant';
import { SUBSCRIPTION_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { SubscriptionGuard } from '@core/guards/subscription.guard';
import { CUSTOM_LOGGER } from '@core/logger/interface/custom-logger.interface';
import { LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { Module } from '@nestjs/common';
import { sharedProviders } from '@shared/shared.provider';

@Module({
    providers: [...sharedProviders, SubscriptionGuard],
    exports: [
        SubscriptionGuard,
        CUSTOM_LOGGER,
        LOGGER_FACTORY,
        SCHEDULES_MAPPER,
        ADMIN_MAPPER,
        CUSTOMER_MAPPER,
        PROVIDER_MAPPER,
        TRANSACTION_MAPPER,
        SUBSCRIPTION_MAPPER,
        WALLET_LEDGER_MAPPER,
        CHAT_MAPPER,
        MESSAGE_MAPPER,
        PLAN_MAPPER,
        SERVICE_OFFERED_MAPPER,
        SLOT_RULE_MAPPER,
        BOOKING_MAPPER,
        WALLET_MAPPER,
        NOTIFICATION_MAPPER,
        RESERVATION_MAPPER,
        REPORT_MAPPER,
        ADMIN_SETTINGS_MAPPER,
        SUBSCRIPTION_REPOSITORY_NAME,
        AVAILABILITY_MAPPER,
        PROFESSION_MAPPER,
        SERVICE_CATEGORY_MAPPER,
        PROVIDER_SERVICE_MAPPER,
        CART_MAPPER
    ]
})
export class SharedModule { }