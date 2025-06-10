import { Module } from "@nestjs/common";
import { RazorpayController } from "./controllers/razorpay.controller";
import { JwtConfigModule } from "src/configs/jwt/jwt.module";
import { paymentServiceProviders } from "./providers/service.providers";
import { paymentUtilityProviders } from "./providers/utillity.providers";
import { paymentRepositoryProviders } from "./providers/repository.providers";

@Module({
    imports: [JwtConfigModule],
    controllers: [RazorpayController],
    providers: [
        ...paymentServiceProviders,
        ...paymentUtilityProviders,
        ...paymentRepositoryProviders
    ]
})
export class PaymentModule { }