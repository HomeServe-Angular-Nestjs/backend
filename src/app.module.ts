import { BookingService } from './modules/bookings/services/implementations/booking.service';
import { UserModule } from './modules/users/user.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Cache with Redis
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 1000,
      store: redisStore,
    }),

    //Other Modules
    AuthModule,
    SeedsModule,
    UserModule,
    ProviderModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
