import { ADMIN_MAPPER, BOOKED_SLOT_MAPPER, BOOKING_MAPPER, CHAT_MAPPER, CUSTOMER_MAPPER, MESSAGE_MAPPER, PLAN_MAPPER, PROVIDER_MAPPER, SCHEDULES_MAPPER, SERVICE_OFFERED_MAPPER, SLOT_RULE_MAPPER, SUBSCRIPTION_MAPPER, TRANSACTION_MAPPER } from '@core/constants/mappers.constant';
import { CUSTOM_LOGGER } from '@core/logger/interface/custom-logger.interface';
import { LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { Module } from '@nestjs/common';
import { sharedProviders } from '@shared/shared.provider';

@Module({
    providers: [...sharedProviders],
    exports: [
        CUSTOM_LOGGER,
        LOGGER_FACTORY,
        SCHEDULES_MAPPER,
        ADMIN_MAPPER,
        CUSTOMER_MAPPER,
        PROVIDER_MAPPER,
        TRANSACTION_MAPPER,
        SUBSCRIPTION_MAPPER,
        CHAT_MAPPER,
        MESSAGE_MAPPER,
        PLAN_MAPPER,
        SERVICE_OFFERED_MAPPER,
        SLOT_RULE_MAPPER,
        BOOKED_SLOT_MAPPER,
        BOOKING_MAPPER,
    ]
})
export class SharedModule { }