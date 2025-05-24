import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export type FilterStatusType = true | false | 'all';

export class FilterDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsBoolean()
    status: FilterStatusType;

    @IsOptional()
    @IsBoolean()
    isCertified: boolean;
}

export class UpdateSavedProvidersDto {
    @IsNotEmpty()
    @IsString()
    providerId: string;
}