import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";


export type FilterStatusType = true | false | 'all';

class SlotDto {
    @IsNotEmpty()
    @IsString()
    from: string;

    @IsNotEmpty()
    @IsString()
    to: string;
}

export class UpdateDefaultSlotsDto {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => SlotDto)
    slot: SlotDto;
}

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