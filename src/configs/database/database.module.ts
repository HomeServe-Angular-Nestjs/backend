import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

import {
  ADMIN_MODEL_NAME,
  BOOKINGS_MODEL_NAME,
  CUSTOMER_MODEL_NAME,
  OTP_MODEL_NAME,
  PROVIDER_MODEL_NAME,
  SCHEDULE_MODEL_NAME,
  SCHEDULES_MODEL_NAME,
  SERVICE_OFFERED_MODEL_NAME,
  TRANSACTION_MODEL_NAME,
} from '../../core/constants/model.constant';


import { CustomerSchema } from '../../core/schema/customer.schema';
import { OtpSchema } from '../../core/schema/otp.schema';
import { ProviderSchema } from '../../core/schema/provider.schema';
import { AdminSchema } from '../../core/schema/admin.schema';
import { ServiceSchema } from '../../core/schema/service.schema';
// import { ScheduleSchema } from '../../core/schema/schedule.schema';
import { BookingSchema } from '../../core/schema/bookings.schema';
import { TransactionSchema } from 'src/core/schema/transaction.schema';
import { SchedulesSchema } from 'src/core/schema/schedules.schema';


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
      { name: CUSTOMER_MODEL_NAME, schema: CustomerSchema },
      { name: PROVIDER_MODEL_NAME, schema: ProviderSchema },
      { name: OTP_MODEL_NAME, schema: OtpSchema },
      { name: ADMIN_MODEL_NAME, schema: AdminSchema },
      { name: SERVICE_OFFERED_MODEL_NAME, schema: ServiceSchema },
      //
      // { name: SCHEDULE_MODEL_NAME, schema: ScheduleSchema },
      { name: BOOKINGS_MODEL_NAME, schema: BookingSchema },
      { name: TRANSACTION_MODEL_NAME, schema: TransactionSchema },
      { name: SCHEDULES_MODEL_NAME, schema: SchedulesSchema },

    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule { }
