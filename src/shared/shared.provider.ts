import { ADMIN_MAPPER, ADMIN_SETTINGS_MAPPER, AVAILABILITY_MAPPER, BOOKING_MAPPER, CART_MAPPER, CHAT_MAPPER, COUPON_MAPPER, CUSTOMER_MAPPER, MESSAGE_MAPPER, NOTIFICATION_MAPPER, PLAN_MAPPER, PROFESSION_MAPPER, PROVIDER_MAPPER, PROVIDER_SERVICE_MAPPER, REPORT_MAPPER, RESERVATION_MAPPER, SERVICE_CATEGORY_MAPPER, SERVICE_OFFERED_MAPPER, SUBSCRIPTION_MAPPER, TRANSACTION_MAPPER, WALLET_LEDGER_MAPPER, WALLET_MAPPER } from '@core/constants/mappers.constant';
import { SUBSCRIPTION_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { AdminSettingsMapper } from '@core/dto-mapper/implementation/admin-settings.mapper';
import { AdminMapper } from '@core/dto-mapper/implementation/admin.mapper';
import { AvailabilityMapper } from '@core/dto-mapper/implementation/availability.mapper';
import { BookingMapper } from '@core/dto-mapper/implementation/booking.mapper';
import { CartMapper } from '@core/dto-mapper/implementation/cart.mapper';
import { ChatMapper } from '@core/dto-mapper/implementation/chat.mapper';
import { CouponMapper } from '@core/dto-mapper/implementation/coupon.mapper';
import { CustomerMapper } from '@core/dto-mapper/implementation/customer.mapper';
import { MessageMapper } from '@core/dto-mapper/implementation/message.mapper';
import { NotificationMapper } from '@core/dto-mapper/implementation/notification.mapper';
import { PlanMapper } from '@core/dto-mapper/implementation/plan.mapper';
import { ProfessionMapper } from '@core/dto-mapper/implementation/profession.mapper';
import { ProviderServiceMapper } from '@core/dto-mapper/implementation/provider-service.mapper';
import { ProviderMapper } from '@core/dto-mapper/implementation/provider.mapper';
import { ReportMapper } from '@core/dto-mapper/implementation/report.mapper';
import { ReservationMapper } from '@core/dto-mapper/implementation/reservation.mapper';
import { ServiceCategoryMapper } from '@core/dto-mapper/implementation/service-category.mapper';
import { ServiceOfferedMapper } from '@core/dto-mapper/implementation/serviceOffered.mapper';
import { SubscriptionMapper } from '@core/dto-mapper/implementation/subscription.mapper';
import { TransactionMapper } from '@core/dto-mapper/implementation/transaction.mapper';
import { WalletLedgerMapper } from '@core/dto-mapper/implementation/wallet-ledger.mapper';
import { WalletMapper } from '@core/dto-mapper/implementation/wallet.mapper';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { LoggerFactory } from '@core/logger/implementation/logger.factory';
import { CUSTOM_LOGGER } from '@core/logger/interface/custom-logger.interface';
import { LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { SubscriptionRepository } from '@core/repositories/implementations/subscription.repository';
import { Provider } from '@nestjs/common';

export const sharedProviders: Provider[] = [
    {
        provide: COUPON_MAPPER,
        useClass: CouponMapper
    },
    {
        provide: CART_MAPPER,
        useClass: CartMapper
    },
    {
        provide: PROVIDER_SERVICE_MAPPER,
        useClass: ProviderServiceMapper
    },
    {
        provide: CUSTOM_LOGGER,
        useClass: CustomLogger,
    },
    {
        provide: LOGGER_FACTORY,
        useClass: LoggerFactory
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
        provide: WALLET_MAPPER,
        useClass: WalletMapper
    },
    {
        provide: NOTIFICATION_MAPPER,
        useClass: NotificationMapper
    },
    {
        provide: RESERVATION_MAPPER,
        useClass: ReservationMapper
    },
    {
        provide: REPORT_MAPPER,
        useClass: ReportMapper
    },
    {
        provide: ADMIN_SETTINGS_MAPPER,
        useClass: AdminSettingsMapper
    },
    {
        provide: SUBSCRIPTION_REPOSITORY_NAME,
        useClass: SubscriptionRepository
    },
    {
        provide: WALLET_LEDGER_MAPPER,
        useClass: WalletLedgerMapper
    },
    {
        provide: AVAILABILITY_MAPPER,
        useClass: AvailabilityMapper
    },
    {
        provide: PROFESSION_MAPPER,
        useClass: ProfessionMapper
    },
    {
        provide: SERVICE_CATEGORY_MAPPER,
        useClass: ServiceCategoryMapper
    }
];