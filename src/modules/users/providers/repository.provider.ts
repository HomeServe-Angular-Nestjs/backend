import { Model } from 'mongoose';

import {
    ADMIN_SETTINGS_MODEL_NAME,
    BOOKINGS_MODEL_NAME, CUSTOMER_MODEL_NAME, PROVIDER_MODEL_NAME, SUBSCRIPTION_MODEL_NAME,
    WALLET_LEDGER_MODEL_NAME,
    WALLET_MODEL_NAME,
} from '@/core/constants/model.constant';
import {
    ADMIN_SETTINGS_REPOSITORY_NAME,
    BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME,
    SUBSCRIPTION_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME,
    WALLET_LEDGER_REPOSITORY_NAME,
    WALLET_REPOSITORY_NAME
} from '@/core/constants/repository.constant';
import { BookingRepository } from '@/core/repositories/implementations/bookings.repository';
import { CustomerRepository } from '@/core/repositories/implementations/customer.repository';
import { ProviderRepository } from '@/core/repositories/implementations/provider.repository';
import {
    SubscriptionRepository
} from '@/core/repositories/implementations/subscription.repository';
import { TransactionRepository } from '@/core/repositories/implementations/transaction.repository';
import { BookingDocument, TransactionDocument } from '@/core/schema/bookings.schema';
import { CustomerDocument } from '@/core/schema/customer.schema';
import { ProviderDocument } from '@/core/schema/provider.schema';
import { SubscriptionDocument } from '@/core/schema/subscription.schema';
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