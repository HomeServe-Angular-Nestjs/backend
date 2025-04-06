// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
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
    ],
    exports: [MongooseModule],
})
export class DatabaseModule { }