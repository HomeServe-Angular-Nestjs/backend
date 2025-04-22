import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

import { CustomerSchema } from '../../core/schema/customer.schema';
import { OtpSchema } from '../../core/schema/otp.schema';
import { ProviderSchema } from '../../core/schema/provider.schema';
import { AdminSchema } from '../../core/schema/admin.schema';

import {
  ADMIN_MODEL_NAME,
  CUSTOMER_MODEL_NAME,
  OTP_MODEL_NAME,
  PROVIDER_MODEL_NAME,
  SERVICE_OFFERED_MODEL_NAME,
} from '../../core/constants/model.constant';
import { ServiceSchema } from '../../core/schema/service.schema';

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
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
