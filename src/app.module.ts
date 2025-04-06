import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SeedsModule } from './seed/seed.module';
import { DatabaseModule } from './configs/database/database.module';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    
    // Cache with Redis
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 1000,
      store: redisStore
    }),

    //Other Modules
    AuthModule,
    SeedsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { } 
