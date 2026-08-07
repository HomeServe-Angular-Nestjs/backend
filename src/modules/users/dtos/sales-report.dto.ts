import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { BookingStatus } from '@core/enum/bookings.enum';

export class SalesReportQueryDto {
    @IsOptional()
    @IsDateString()
    fromDate: string;

    @IsOptional()
    @IsDateString()
    toDate: string;

    @IsOptional()
    @IsString()
    professionId: string;

    @IsOptional()
    @IsString()
    categoryId: string;

    @IsOptional()
    @IsString()
    providerId: string;

    @IsOptional()
    @IsString()
    @IsEnum(BookingStatus)
    bookingStatus: BookingStatus;
}
