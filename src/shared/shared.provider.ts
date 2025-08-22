import { ADMIN_MAPPER, BOOKING_MAPPER, CHAT_MAPPER, CUSTOMER_MAPPER, MESSAGE_MAPPER, OTP_MAPPER, PLAN_MAPPER, PROVIDER_MAPPER, SCHEDULES_MAPPER, SERVICE_OFFERED_MAPPER, SLOT_RULE_MAPPER, SUBSCRIPTION_MAPPER, TRANSACTION_MAPPER, WALLET_MAPPER } from '@core/constants/mappers.constant';
import { AdminMapper } from '@core/dto-mapper/implementation/admin.mapper';
import { BookingMapper } from '@core/dto-mapper/implementation/booking.mapper';
import { ChatMapper } from '@core/dto-mapper/implementation/chat.mapper';
import { CustomerMapper } from '@core/dto-mapper/implementation/customer.mapper';
import { MessageMapper } from '@core/dto-mapper/implementation/message.mapper';
import { OtpMapper } from '@core/dto-mapper/implementation/otp.mapper';
import { PlanMapper } from '@core/dto-mapper/implementation/plan.mapper';
import { ProviderMapper } from '@core/dto-mapper/implementation/provider.mapper';
import { SchedulesMapper } from '@core/dto-mapper/implementation/schedules.mapper';
import { ServiceOfferedMapper } from '@core/dto-mapper/implementation/serviceOffered.mapper';
import { SlotRuleMapper } from '@core/dto-mapper/implementation/slot-rule.mapper';
import { SubscriptionMapper } from '@core/dto-mapper/implementation/subscription.mapper';
import { TransactionMapper } from '@core/dto-mapper/implementation/transaction.mapper';
import { WalletMapper } from '@core/dto-mapper/implementation/wallet.mapper';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { LoggerFactory } from '@core/logger/implementation/logger.factory';
import { CUSTOM_LOGGER } from '@core/logger/interface/custom-logger.interface';
import { LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { Provider } from '@nestjs/common';

export const sharedProviders: Provider[] = [
    {
        provide: CUSTOM_LOGGER,
        useClass: CustomLogger,
    },
    {
        provide: LOGGER_FACTORY,
        useClass: LoggerFactory
    },
    {
        provide: OTP_MAPPER,
        useClass: OtpMapper
    },
    {
        provide: ADMIN_MAPPER,
        useClass: AdminMapper
    },
    {
        provide: BOOKING_MAPPER,
        useClass: BookingMapper
    },
    {
        provide: CUSTOMER_MAPPER,
        useClass: CustomerMapper
    },
    {
        provide: PROVIDER_MAPPER,
        useClass: ProviderMapper
    },
    {
        provide: TRANSACTION_MAPPER,
        useClass: TransactionMapper
    },
    {
        provide: SCHEDULES_MAPPER,
        useClass: SchedulesMapper
    },
    {
        provide: SUBSCRIPTION_MAPPER,
        useClass: SubscriptionMapper
    },
    {
        provide: CHAT_MAPPER,
        useClass: ChatMapper
    },
    {
        provide: MESSAGE_MAPPER,
        useClass: MessageMapper
    },
    {
        provide: PLAN_MAPPER,
        useClass: PlanMapper
    },
    {
        provide: SERVICE_OFFERED_MAPPER,
        useClass: ServiceOfferedMapper
    },
    {
        provide: SLOT_RULE_MAPPER,
        useClass: SlotRuleMapper
    },
    {
        provide: WALLET_MAPPER,
        useClass: WalletMapper
    }
];