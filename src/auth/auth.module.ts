import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CUSTOMER_MODEL_NAME, OTP_MODEL_NAME, PROVIDER_MODEL_NAME } from "./constants/model.constant";
import { CustomerSchema } from "./schema/customer.schema";
import { OtpSchema } from "./schema/otp.schema";
import { SignUpController } from "./controllers/signup.controller";
import { repositoryProvider } from "./providers/repositories.provider";
import { CommonModule } from "./common/common.module";
import { serviceProvider } from "./providers/service.provider";
import { utilityProvider } from "./providers/utility.provider";
import { ProviderSchema } from "./schema/provider.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: CUSTOMER_MODEL_NAME, schema: CustomerSchema },
            { name: PROVIDER_MODEL_NAME, schema: ProviderSchema },
            { name: OTP_MODEL_NAME, schema: OtpSchema },
        ]),
        CommonModule
    ],
    controllers: [SignUpController],
    providers: [
        ...repositoryProvider,
        ...serviceProvider,
        ...utilityProvider
    ],
})
export class AuthModule { }