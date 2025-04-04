import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './auth/strategies/google.strategy';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // PassportModule.register({ defaultStrategy: 'google' }),

    // Configures the MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI');
        return {
          uri,
          retryAttempts: 5,
          retryDelay: 3000,
          connectionFactory: (connection) => {
            if (connection.readyState === 1) {
              console.log('Successfully connected to MongoDB');
            } else {
              connection.on('connected', () => console.log('MongoDB connected!'));
            }
            connection.on('disconnected', () => console.log('MongoDB disconnected'));
            return connection;
          }
        };
      },
    }),

    // Cache with Redis
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 1000,
      store: redisStore
    }),

    //Other Modules
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { } 
