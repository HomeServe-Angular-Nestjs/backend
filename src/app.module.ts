import { AdminModule } from './modules/users/admin.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SeedsModule } from './seed/seed.module';
import { ProviderModule } from './modules/providers/provider.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { CustomerModule } from './modules/customer/customer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Cache with Redis
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 1000, // 7 * 60 * 60 * 1000
      store: redisStore,
    }),

    //Other Modules
    AuthModule,
    SeedsModule,
    AdminModule,
    ProviderModule,
    BookingsModule,
    CustomerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
