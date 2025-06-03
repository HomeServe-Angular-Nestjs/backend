import { Transform, Type } from "class-transformer";
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";


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
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (value === 'all') return 'all';
        return value;
    })
    @IsIn([true, false, 'all'])
    status: FilterStatusType;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isCertified: boolean;
}