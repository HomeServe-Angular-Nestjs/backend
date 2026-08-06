import { Model } from 'mongoose';

import {
    ADMIN_SETTINGS_MODEL_NAME,
    BOOKINGS_MODEL_NAME, CUSTOMER_MODEL_NAME, PROVIDER_MODEL_NAME, PROVIDER_SERVICE_MODEL_NAME, SUBSCRIPTION_MODEL_NAME,
    WALLET_LEDGER_MODEL_NAME,
    WALLET_MODEL_NAME,
    WEEKLY_AVAILABILITY_MODEL_NAME,
    DATE_OVERRIDE_MODEL_NAME,
} from '@/core/constants/model.constant';
import {
    ADMIN_SETTINGS_REPOSITORY_NAME,
    BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME,
    PROVIDER_SERVICE_REPOSITORY_NAME,
    SUBSCRIPTION_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME,
    WALLET_LEDGER_REPOSITORY_NAME,
    WALLET_REPOSITORY_NAME,
    WEEKLY_AVAILABILITY_REPOSITORY_INTERFACE_NAME,
    DATE_OVERRIDES_REPOSITORY_INTERFACE_NAME,
} from '@/core/constants/repository.constant';
import { BookingRepository } from '@/core/repositories/implementations/bookings.repository';
import { CustomerRepository } from '@/core/repositories/implementations/customer.repository';
import { ProviderRepository } from '@/core/repositories/implementations/provider.repository';
import { ProviderServiceRepository } from '@/core/repositories/implementations/provider-service.repository';
import { WeeklyAvailabilityRepository } from '@/core/repositories/implementations/weekly-availability.repository';
import { DateOverridesRepository } from '@/core/repositories/implementations/date-overrides.repository';
import {
    SubscriptionRepository
} from '@/core/repositories/implementations/subscription.repository';
import { TransactionRepository } from '@/core/repositories/implementations/transaction.repository';
import { BookingDocument, TransactionDocument } from '@/core/schema/bookings.schema';
import { CustomerDocument } from '@/core/schema/customer.schema';
import { ProviderDocument } from '@/core/schema/provider.schema';
import { SubscriptionDocument } from '@/core/schema/subscription.schema';
import { ProviderServiceDocument } from '@/core/schema/provider-service.schema';
import { WeeklyAvailabilityDocument } from '@/core/schema/weekly-availability.schema';
import { DateOverrideDocument } from '@/core/schema/date-overrides.schema';
import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { AdminSettingsDocument } from '@core/schema/admin-settings.schema';
import { AdminSettingsRepository } from '@core/repositories/implementations/admin-settings.repository';
import { LoggerFactory } from '@core/logger/implementation/logger.factory';
import { WalletLedgerDocument } from '@core/schema/wallet-ledger.schema';
import { WalletLedgerRepository } from '@core/repositories/implementations/wallet-ledger.repository';
import { WalletDocument } from '@core/schema/wallet.schema';
import { WalletRepository } from '@core/repositories/implementations/wallet.repository';

export const adminRepositoryProviders: Provider[] = [
    {
        provide: CUSTOMER_REPOSITORY_INTERFACE_NAME,
        useFactory: (customerModel: Model<CustomerDocument>) =>
            new CustomerRepository(customerModel),
        inject: [getModelToken(CUSTOMER_MODEL_NAME)]
    },
    {
        provide: TRANSACTION_REPOSITORY_NAME,
        useFactory: (bookingModel: Model<BookingDocument>) =>
            new TransactionRepository(bookingModel),
        inject: [getModelToken(BOOKINGS_MODEL_NAME)]
    },
    {
        provide: PROVIDER_REPOSITORY_INTERFACE_NAME,
        useFactory: (providerModel: Model<ProviderDocument>) =>
            new ProviderRepository(providerModel),
        inject: [getModelToken(PROVIDER_MODEL_NAME)]
    },
    {
        provide: BOOKING_REPOSITORY_NAME,
        useFactory: (bookingModel: Model<BookingDocument>) =>
            new BookingRepository(bookingModel),
        inject: [getModelToken(BOOKINGS_MODEL_NAME)]
    },
    {
        provide: PROVIDER_SERVICE_REPOSITORY_NAME,
        useFactory: (providerServiceModel: Model<ProviderServiceDocument>) =>
            new ProviderServiceRepository(providerServiceModel),
        inject: [getModelToken(PROVIDER_SERVICE_MODEL_NAME)]
    },
    {
        provide: WEEKLY_AVAILABILITY_REPOSITORY_INTERFACE_NAME,
        useFactory: (weeklyAvailabilityModel: Model<WeeklyAvailabilityDocument>) =>
            new WeeklyAvailabilityRepository(weeklyAvailabilityModel),
        inject: [getModelToken(WEEKLY_AVAILABILITY_MODEL_NAME)]
    },
    {
        provide: DATE_OVERRIDES_REPOSITORY_INTERFACE_NAME,
        useFactory: (dateOverrideModel: Model<DateOverrideDocument>) =>
            new DateOverridesRepository(dateOverrideModel),
        inject: [getModelToken(DATE_OVERRIDE_MODEL_NAME)]
    },
    {
        provide: WALLET_LEDGER_REPOSITORY_NAME,
        useFactory: (walletLedgerModel: Model<WalletLedgerDocument>) =>
            new WalletLedgerRepository(walletLedgerModel),
        inject: [getModelToken(WALLET_LEDGER_MODEL_NAME)]
    },
    {
        provide: SUBSCRIPTION_REPOSITORY_NAME,
        useFactory: (subscriptionModel: Model<SubscriptionDocument>) =>
            new SubscriptionRepository(subscriptionModel),
        inject: [getModelToken(SUBSCRIPTION_MODEL_NAME)]
    },
    {
        provide: ADMIN_SETTINGS_REPOSITORY_NAME,
        useFactory: (settingsModel: Model<AdminSettingsDocument>) =>
            new AdminSettingsRepository(settingsModel, new LoggerFactory()),
        inject: [getModelToken(ADMIN_SETTINGS_MODEL_NAME)]
    },
    {
        provide: WALLET_REPOSITORY_NAME,
        useFactory: (walletModel: Model<WalletDocument>) =>
            new WalletRepository(new LoggerFactory(), walletModel),
        inject: [getModelToken(WALLET_MODEL_NAME)]
    }
];