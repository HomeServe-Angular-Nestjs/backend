import { Connection, ConnectionStates } from 'mongoose';

import {
  ADMIN_MODEL_NAME, ADMIN_SETTINGS_MODEL_NAME, BOOKINGS_MODEL_NAME, CHAT_MODEL_NAME, CUSTOMER_MODEL_NAME, DATE_OVERRIDE_MODEL_NAME, MESSAGE_MODEL_NAME,
  NOTIFICATION_MODEL_NAME, PLAN_MODEL_NAME, PROFESSION_MODEL_NAME, PROVIDER_MODEL_NAME, PROVIDER_SERVICE_MODEL_NAME, REPORT_MODEL_NAME, RESERVATION_MODEL_NAME,
  SERVICE_CATEGORY_MODEL_NAME, SERVICE_OFFERED_MODEL_NAME, SUBSCRIPTION_MODEL_NAME, WALLET_LEDGER_MODEL_NAME, WALLET_MODEL_NAME, WEEKLY_AVAILABILITY_MODEL_NAME
} from '@core/constants/model.constant';
import { AdminSchema } from '@core/schema/admin.schema';
import { BookingSchema } from '@core/schema/bookings.schema';
import { ChatSchema } from '@core/schema/chat.schema';
import { CustomerSchema } from '@core/schema/customer.schema';
import { MessageSchema } from '@core/schema/message.schema';
import { ProviderSchema } from '@core/schema/provider.schema';
import { ServiceSchema } from '@core/schema/service.schema';
import { SubscriptionSchema } from '@core/schema/subscription.schema';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletSchema } from '@core/schema/wallet.schema';
import { NotificationSchema } from '@core/schema/notification.schema';
import { ReservationSchema } from '@core/schema/reservation.schema';
import { ReportSchema } from '@core/schema/report.schema';
import { AdminSettingSchema } from '@core/schema/admin-settings.schema';
import { WalletLedgerSchema } from '@core/schema/wallet-ledger.schema';
import { PlanSchema } from '@core/schema/plans.schema';
import { DateOverrideSchema } from '@core/schema/date-overrides.schema';
import { WeeklyAvailabilitySchema } from '@core/schema/weekly-availability.schema';
import { ProfessionSchema } from '@core/schema/profession.schema';
import { ServiceCategorySchema } from '@core/schema/service-category';
import { ProviderServiceSchema } from '@core/schema/provider-service.schema';
import { CART_MODEL_NAME } from '@core/constants/model.constant';
import { CartSchema } from '@core/schema/cart.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI');
        return {
          uri,
          retryAttempts: 5,
          retryDelay: 3000,
          autoIndex: true,
          connectionFactory: (connection: Connection): Connection => {
            if (connection.readyState === ConnectionStates.connected) {
              console.log('Successfully connected to MongoDB');
            } else {
              connection.on('connected', () =>
                console.log('MongoDB connected!'),
              );
            }
            connection.on('disconnected', () =>
              console.log('MongoDB disconnected'),
            );
            return connection;
          },
        };
      },

    }),

    MongooseModule.forFeature([
      { name: WEEKLY_AVAILABILITY_MODEL_NAME, schema: WeeklyAvailabilitySchema },
      { name: SERVICE_CATEGORY_MODEL_NAME, schema: ServiceCategorySchema },
      { name: PROVIDER_SERVICE_MODEL_NAME, schema: ProviderServiceSchema },
      { name: ADMIN_SETTINGS_MODEL_NAME, schema: AdminSettingSchema },
      { name: WALLET_LEDGER_MODEL_NAME, schema: WalletLedgerSchema },
      { name: DATE_OVERRIDE_MODEL_NAME, schema: DateOverrideSchema },
      { name: SUBSCRIPTION_MODEL_NAME, schema: SubscriptionSchema },
      { name: NOTIFICATION_MODEL_NAME, schema: NotificationSchema },
      { name: SERVICE_OFFERED_MODEL_NAME, schema: ServiceSchema },
      { name: RESERVATION_MODEL_NAME, schema: ReservationSchema },
      { name: PROFESSION_MODEL_NAME, schema: ProfessionSchema },
      { name: CUSTOMER_MODEL_NAME, schema: CustomerSchema },
      { name: PROVIDER_MODEL_NAME, schema: ProviderSchema },
      { name: BOOKINGS_MODEL_NAME, schema: BookingSchema },
      { name: MESSAGE_MODEL_NAME, schema: MessageSchema },
      { name: REPORT_MODEL_NAME, schema: ReportSchema },
      { name: WALLET_MODEL_NAME, schema: WalletSchema },
      { name: ADMIN_MODEL_NAME, schema: AdminSchema },
      { name: CHAT_MODEL_NAME, schema: ChatSchema },
      { name: PLAN_MODEL_NAME, schema: PlanSchema },
      { name: CART_MODEL_NAME, schema: CartSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule { }
