import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { RatingSearchBy, RatingsSortBy } from "src/core/enum/ratings.enum";

export type FilterStatusType = true | false | 'all';
export type RoleType = 'customer' | 'provider';

export class GetUsersWithFilterDto {
    @IsOptional()
    @Transform(({ value }) => Number(value) || 1)
    @IsNumber()
    @Min(1)
    page: number;

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


export class FilterWithPaginationDto {
    @Transform(({ value }) => isNaN(value) || !value ? 1 : value)
    page: number;

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