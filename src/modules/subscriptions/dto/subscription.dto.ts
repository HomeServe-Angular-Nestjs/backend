import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { SubsDurationEnum, } from '@core/enum/subscription.enum';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { SubscriptionStatusType } from '@core/entities/interfaces/subscription.entity.interface';
import { Transform } from 'class-transformer';

export class CreateSubscriptionDto {
    @IsNotEmpty()
    @IsString()
    planId: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(SubsDurationEnum))
    duration: SubsDurationEnum;
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

export class SubscriptionFiltersDto {
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    page: number;

    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    limit: number;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn(['active', 'expired', 'inactive', 'all'])
    status?: SubscriptionStatusType | 'all';

    @IsOptional()
    @IsIn([...Object.values(PaymentStatus), 'all'])
    payment?: PaymentStatus | 'all';

    @IsOptional()
    @IsIn([...Object.values(SubsDurationEnum), 'all'])
    duration?: SubsDurationEnum | 'all';
}

export class UpdateSubscriptionStatusDto {
    @IsNotEmpty()
    @IsBoolean()
    status: boolean;
}