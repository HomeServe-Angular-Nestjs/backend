import { PaymentDirection, TransactionType } from "@core/enum/transaction.enum";
import { Transform } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";

export class PageDto {
    @Transform(({ value }) => Number(value) || 1)
    @IsNumber()
    page: number;

    @Transform(({ value }) => Number(value) || 10)
    @IsNumber()
    limit: number;
}

export class ProviderWalletFilterDto extends PageDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    @IsIn(['newest', 'oldest', 'high', 'low'])
    sort: 'newest' | 'oldest' | 'high' | 'low';

    @IsOptional()
    @IsString()
    @IsIn(['all', ...Object.values(TransactionType)])
    type: TransactionType | 'all';

    @IsOptional()
    @IsString()
    @IsIn(['all', 'last_six_months', 'last_year'])
    date: 'all' | 'last_six_months' | 'last_year';

    @IsOptional()
    @IsString()
    @IsIn(['all', ...Object.values(PaymentDirection)])
    method: PaymentDirection | 'all';
}