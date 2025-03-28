import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { connection } from 'mongoose';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Configures the MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
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

    //Other Modules
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { } 
