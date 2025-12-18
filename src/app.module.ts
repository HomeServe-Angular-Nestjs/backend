import { redisStore } from 'cache-manager-redis-store';

import { AppController } from '@app/.controller';
import { appProviders } from '@app/.provider';
import { AppService } from '@app/.service';
import { JwtConfigModule } from '@configs/jwt/jwt.module';
import { AuthModule } from '@modules/auth/auth.module';
import { AuthMiddleware } from '@modules/auth/middleware/auth.middleware';
import { BookingsModule } from '@modules/bookings/bookings.module';
import { CustomerModule } from '@modules/customer/customer.module';
import { PaymentModule } from '@modules/payment/payment.module';
import { PlanModule } from '@modules/plans/plans.module';
import { ProviderModule } from '@modules/providers/provider.module';
import { SubscriptionModules } from '@modules/subscriptions/subscription.module';
import { WebSocketModule } from '@modules/websockets/websocket.module';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SeedsModule } from '../seed/seed.module';
import { AdminModule } from './modules/users/admin.module';
import { SlotModule } from '@modules/slots/slots.module';
import { WalletModule } from '@modules/wallet/wallet.module';
import { ReportModule } from '@modules/reports/report.module';
import { AvailabilityModule } from '@modules/availability/availability.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`
    }),

    JwtConfigModule,

    // Cache with Redis
    CacheModule.register({
      isGlobal: true,
      ttl: Number(process.env.REDIS_TTL) || 7 * 24 * 60 * 60,
      store: redisStore,
    }),

    //Other Modules
    AuthModule,
    SeedsModule,
    AdminModule,
    ProviderModule,
    BookingsModule,
    CustomerModule,
    PaymentModule,
    WebSocketModule,
    PlanModule,
    SubscriptionModules,
    SlotModule,
    WalletModule,
    ReportModule,
    AvailabilityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ...appProviders,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
