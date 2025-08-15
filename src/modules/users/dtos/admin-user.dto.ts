import { Transform } from 'class-transformer';
import {
    IsBoolean, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min
} from 'class-validator';

import { BookingSearchBy, BookingStatus, PaymentStatus } from '@core/enum/bookings.enum';
import { RatingSearchBy, RatingsSortBy } from '@core/enum/ratings.enum';
import { ReportCategoryType } from '@core/entities/interfaces/admin.entity.interface';

export type FilterStatusType = true | false | 'all';
export type RoleType = 'customer' | 'provider';

export class PageDto {
    @IsOptional()
    @Transform(({ value }) => Number(value) || 1)
    @IsNumber()
    @Min(1)
    page: number;
}

export class GetUsersWithFilterDto extends PageDto {
    @IsNotEmpty()
    @IsIn(['customer', 'provider'], {
        message: 'Role must be either "customer" or "provider"',
    })
    role: RoleType;

    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (value === 'all') return 'all';
        return value;
    })
    @IsIn([true, false, 'all'])
    status: FilterStatusType
}

export class StatusUpdateDto {

    @IsNotEmpty()
    @IsBoolean()
    status: boolean;

    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsIn(['customer', 'provider'], {
        message: 'Role must be either "customer" or "provider"',
    })
    role: RoleType;
}

export class RemoveUserDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsIn(['customer', 'provider'], {
        message: 'Role must be either "customer" or "provider"',
    })
    role: RoleType;
}

export class GetBookingsFilter extends PageDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    @IsEnum(BookingSearchBy)
    searchBy: string;

    @IsOptional()
    @IsString()
    bookingStatus: BookingStatus;

    @IsOptional()
    @IsString()
    paymentStatus: PaymentStatus;
}

export class FilterWithPaginationDto extends PageDto {
    @IsOptional()
    @Transform(({ value }) => {
        if (!value) return;
        const num = Number(value);
        if (isNaN(num)) return;
        return num;
    })
    minRating?: string;

    @IsOptional()
    @IsEnum(RatingsSortBy)
    sortBy?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(RatingSearchBy)
    searchBy?: string;
}

export class UpdateReviewStatus {
    @IsNotEmpty()
    @IsString()
    reviewId: string;

    @IsNotEmpty()
    @IsString()
    providerId: string;

    @IsNotEmpty()
    @IsBoolean()
    status: boolean;
}

class ReportDownloadDto {
    @IsNotEmpty()
    @IsString()
    category: ReportCategoryType;

    @IsOptional()
    fromDate: string;

    @IsOptional()
    toDate: string;
}

export class BookingReportDownloadDto extends ReportDownloadDto {
    @IsOptional()
    userId: string;

    @IsOptional()
    status: string;
}

export class UserReportDownloadDto extends ReportDownloadDto {
    @IsOptional()
    @IsString()
    role: 'customer' | 'provider';


    @IsOptional()
    @IsIn(['active', 'blocked'])
    status: 'active' | 'blocked';
}

export class TransactionReportDownloadDto extends ReportDownloadDto {
    @IsOptional()
    @IsString()
    method: string;

    @IsOptional()
    @IsString()
    transactionType: string;
}