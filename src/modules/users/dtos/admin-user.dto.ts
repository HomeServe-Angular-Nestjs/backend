import { Transform } from "class-transformer";
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

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
