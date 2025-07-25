import { Transform, Type } from 'class-transformer';
import {
    IsArray, IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsPositive, IsString,
    Min, ValidateNested
} from 'class-validator';

import { TransactionStatus, TransactionType } from '@core/enum/transaction.enum';

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

    @IsString()
    @IsIn(Object.values(TransactionType))
    transactionType: TransactionType;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @Min(0)
    amount: number;

    @IsString()
    currency: string;

    @IsIn(Object.values(TransactionStatus))
    status: TransactionStatus;

    @IsOptional()
    @IsString()
    method?: string;

    @IsOptional()
    @IsString()
    receipt?: string;

    @IsOptional()
    @IsString()
    offer_id?: string | null;

    @IsNumber()
    created_at: number;
}

export class RazorpayVerifyDto {
    @Type(() => RazorpayVerifyData)
    @ValidateNested()
    verifyData: RazorpayVerifyData;

    @Type(() => VerifyOrderData)
    @ValidateNested()
    orderData: VerifyOrderData;

    @IsString()
    @IsIn(['customer', 'provider'])
    role: string;
}