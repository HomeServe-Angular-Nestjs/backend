import { JwtConfigModule } from '@configs/jwt/jwt.module';
import { RazorpayController } from '@modules/payment/controllers/razorpay.controller';
import { paymentRepositoryProviders } from '@modules/payment/providers/repository.providers';
import { paymentServiceProviders } from '@modules/payment/providers/service.providers';
import { paymentUtilityProviders } from '@modules/payment/providers/utility.providers';
import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';

@Module({
    imports: [JwtConfigModule, SharedModule],
    controllers: [RazorpayController],
    providers: [
        ...paymentServiceProviders,
        ...paymentUtilityProviders,
        ...paymentRepositoryProviders
    ]
})
export class PaymentModule { }