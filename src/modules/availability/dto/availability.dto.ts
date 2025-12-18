import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsString, Matches, ValidateNested } from 'class-validator';

export class TimeRangeDto {
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'startTime must be in HH:mm format',
    })
    startTime: string;

    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'endTime must be in HH:mm format',
    })
    endTime: string;
}

export class DayAvailabilityDto {
    @IsBoolean()
    isAvailable: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeRangeDto)
    timeRanges: TimeRangeDto[];
}

export class WeeklyAvailabilityDto {
    @ValidateNested()
    @Type(() => DayAvailabilityDto)
    sun: DayAvailabilityDto;

    @ValidateNested()
    @Type(() => DayAvailabilityDto)
    mon: DayAvailabilityDto;

    @ValidateNested()
    @Type(() => DayAvailabilityDto)
    tue: DayAvailabilityDto;

    @ValidateNested()
    @Type(() => DayAvailabilityDto)
    wed: DayAvailabilityDto;

    @ValidateNested()
    @Type(() => DayAvailabilityDto)
    thu: DayAvailabilityDto;

    @ValidateNested()
    @Type(() => DayAvailabilityDto)
    fri: DayAvailabilityDto;

    @ValidateNested()
    @Type(() => DayAvailabilityDto)
    sat: DayAvailabilityDto;
}

export class UpdateWeeklyAvailabilityDto {
    @ValidateNested()
    @Type(() => WeeklyAvailabilityDto)
    week: WeeklyAvailabilityDto;
}