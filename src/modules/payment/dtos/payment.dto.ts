import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsIn, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderDto {
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    amount: number;
}

export class RazorpayVerifyDto {
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