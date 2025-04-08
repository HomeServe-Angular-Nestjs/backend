import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { userServiceProvider } from './providers/service.provider';
import { repositoryProvider } from '../auth/providers/repositories.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { ADMIN_MODEL_NAME, CUSTOMER_MODEL_NAME, OTP_MODEL_NAME, PROVIDER_MODEL_NAME } from '../../core/constants/model.constant';
import { CustomerSchema } from '../../core/schema/customer.schema';
import { ProviderSchema } from '../../core/schema/provider.schema';
import { OtpSchema } from '../../core/schema/otp.schema';
import { AdminSchema } from '../../core/schema/admin.schema';
import { CommonModule } from '../../core/common.module';

@Module({
    imports: [],
    controllers: [UserController],
    providers: [
        ...userServiceProvider,
        ...repositoryProvider
    ],
})
export class UserModule { }