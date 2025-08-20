import { Transform, Type } from 'class-transformer';
import {
    IsIn, IsNotEmpty, IsNumber, IsOptional, IsString,
    Min, ValidateNested
} from 'class-validator';

import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from '@core/enum/transaction.enum';

export class CreateOrderDto {
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    amount: number;
}

export class RazorpayVerifyData {
    @IsNotEmpty()
    @IsString()
    razorpay_order_id: string;

    @IsNotEmpty()
    @IsString()
    razorpay_payment_id: string;

    @IsNotEmpty()
    @IsString()
    razorpay_signature: string;
}

export class VerifyOrderData {
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(TransactionType))
    transactionType: TransactionType;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(PaymentDirection))
    direction: PaymentDirection;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(PaymentSource))
    source: PaymentSource;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @Min(0)
    amount: number;

    @IsIn(Object.values(TransactionStatus))
    status: TransactionStatus;

    @IsOptional()
    @IsString()
    receipt?: string;
}

export class RazorpayVerifyDto {
    @Type(() => RazorpayVerifyData)
    @ValidateNested()
    verifyData: RazorpayVerifyData;

    @Type(() => VerifyOrderData)
    @ValidateNested()
    orderData: VerifyOrderData;
}