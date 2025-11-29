import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { PlanRoleEnum, SubsDurationType, } from '@core/enum/subscription.enum';
import { Transform } from 'class-transformer';
import { PaymentStatus } from '@core/enum/bookings.enum';

export class CreateSubscriptionDto {
    @IsNotEmpty()
    @IsString()
    planId: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    transactionId: null;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(SubsDurationType))
    duration: SubsDurationType;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(PlanRoleEnum))
    role: PlanRoleEnum;

    @IsNotEmpty()
    @IsString({ each: true })
    features: string[];

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(PaymentStatus))
    paymentStatus: PaymentStatus;

    @IsNotEmpty()
    @IsString()
    startTime: string;

    @IsNotEmpty()
    @IsString()
    endDate: string;

    @Transform(({ value }) => {
        const num = Number(value);
        return isNaN(num) ? undefined : num;
    })
    @IsNotEmpty()
    @IsNumber()
    price: number;
}

export class UpdatePaymentStatusDto {
    @IsNotEmpty()
    @IsString()
    transactionId: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(PaymentStatus))
    paymentStatus: PaymentStatus;

    @IsNotEmpty()
    @IsString()
    subscriptionId: string;
}