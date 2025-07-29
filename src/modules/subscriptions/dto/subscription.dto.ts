import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { PlanRoleType, SubsDurationType, SubsPaymentStatus } from '@core/enum/subscription.enum';
import { Transform } from 'class-transformer';

export class CreateSubscriptionDto {
    @IsNotEmpty()
    @IsString()
    planId: string;

    @IsNotEmpty()
    @IsString()
    transactionId: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(SubsDurationType))
    duration: SubsDurationType;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(PlanRoleType))
    role: PlanRoleType;

    @IsNotEmpty()
    @IsString({ each: true })
    features: string[];

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(SubsPaymentStatus))
    paymentStatus?: SubsPaymentStatus;

    @IsNotEmpty()
    @IsString()
    startTime: string;

    @IsNotEmpty()
    endDate: string | null;

    @Transform(({ value }) => {
        const num = Number(value);
        return isNaN(num) ? undefined : num;
    })
    @IsNotEmpty()
    @IsNumber()
    price: number;
}