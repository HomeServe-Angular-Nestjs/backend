import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignupModule } from './modules/auth/signup/signup.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Configures the MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        retryAttempts: 5,
        retryDelay: 3000,
      }),
    }),

    //Other Modules
    SignupModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { } 
