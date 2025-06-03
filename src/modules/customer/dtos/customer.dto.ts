import { Transform } from "class-transformer";
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export type FilterStatusType = true | false | 'all';

export class FilterDto {
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

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isCertified: boolean;
}

export class UpdateSavedProvidersDto {
    @IsNotEmpty()
    @IsString()
    providerId: string;
}