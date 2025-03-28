import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CustomerSchema } from "./schema/customer.schema";
import { OtpSchema } from "./schema/otp.schema";
import { ProviderSchema } from "./schema/provider.schema";

import { CUSTOMER_MODEL_NAME, OTP_MODEL_NAME, PROVIDER_MODEL_NAME } from "./constants/model.constant";

import { SignUpController } from "./controllers/signup.controller";
import { LoginController } from "./controllers/login.controller";

import { repositoryProvider } from "./providers/repositories.provider";
import { serviceProvider } from "./providers/service.provider";
import { utilityProvider } from "./providers/utility.provider";

import { CommonModule } from "./common/common.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: CUSTOMER_MODEL_NAME, schema: CustomerSchema },
            { name: PROVIDER_MODEL_NAME, schema: ProviderSchema },
            { name: OTP_MODEL_NAME, schema: OtpSchema },
        ]),
        CommonModule
    ],
    controllers: [SignUpController, LoginController],
    providers: [
        ...repositoryProvider,
        ...serviceProvider,
        ...utilityProvider
    ],
})
export class AuthModule { }
