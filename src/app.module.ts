import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { connection } from 'mongoose';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

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

    // // JWT Module
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (config: ConfigService) => ({
    //     secret: config.get<string>('JWT_ACCESS_SECRET'),
    //     signOptions: {
    //       expiresIn: config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    //       issuer: config.get('JWT_ISSUER', 'HomeServe'),
    //     },
    //   })
    // }),

    //Other Modules
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { } 
