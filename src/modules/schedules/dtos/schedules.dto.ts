import { Transform, Type } from 'class-transformer';
import { IsString, Matches, IsOptional, ValidateNested, ArrayMinSize, IsDefined, IsBoolean, IsIn, IsNumber } from 'class-validator';

export class PageDto {
    @IsDefined()
    @IsNumber()
    page: number;
}

export class ScheduleListFilterDto extends PageDto {

}

export class SlotDto {
    @IsString()
    @Matches(/^((0?[1-9])|(1[0-2])):[0-5][0-9]\s?(AM|PM)$/i, {
        message: 'from must be in valid 12-hour format (e.g., "9:00 AM")',
    })
    from: string;

    @IsString()
    @Matches(/^((0?[1-9])|(1[0-2])):[0-5][0-9]\s?(AM|PM)$/i, {
        message: 'to must be in valid 12-hour format (e.g., "5:00 PM")',
    })
    to: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => !value ? null : value)
    takenBy: string | null;
}

export class DaySlotsDto {
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'date must be in YYYY-MM-DD format',
    })
    date: string;

    @ValidateNested({ each: true })
    @Type(() => SlotDto)
    @ArrayMinSize(1, { message: 'Each day must have at least one slot' })
    slots: SlotDto[];
}


export class MonthScheduleDto {
    @IsString()
    @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
        message: 'month must be in YYYY-MM format',
    })
    month: string;

    @ValidateNested({ each: true })
    @Type(() => DaySlotsDto)
    @ArrayMinSize(1, { message: 'At least one day with slots is required' })
    days: DaySlotsDto[];
}

type ScheduleDetailsStatusType = 'all' | 'true' | 'false';

export class ScheduleDetailsFilterDto {
    @IsOptional()
    @IsString()
    @IsIn(['all', 'true', 'false'])
    status?: ScheduleDetailsStatusType;

    @IsOptional()
    @IsString()
    date?: string;

    @IsOptional()
    @IsString()
    @IsIn(['all', 'booked', 'available'])
    availableType?: string;
}

export class ScheduleDetailsDto extends ScheduleDetailsFilterDto {
    @IsDefined()
    @IsString()
    id: string;

    @IsDefined()
    @IsString()
    @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
        message: 'month must be in YYYY-MM format',
    })
    month: string;
}

export class UpdateScheduleStatusDto {
    @IsDefined()
    @IsString()
    scheduleId: string

    @IsDefined()
    @IsBoolean()
    status: boolean;
}

export class UpdateScheduleDateStatusDto {
    @IsDefined()
    @IsString()
    scheduleId: string;

    @IsDefined()
    @IsString()
    dayId: string;

    @IsDefined()
    @IsString()
    @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
        message: 'month must be in YYYY-MM format',
    })
    month: string;

    @IsDefined()
    @IsBoolean()
    status: boolean;
}

export class UpdateScheduleDateSlotStatusDto {
    @IsDefined()
    @IsString()
    scheduleId: string;

    @IsDefined()
    @IsString()
    @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
        message: 'month must be in YYYY-MM format',
    })
    month: string;

    @IsDefined()
    @IsString()
    dayId: string;

    @IsDefined()
    @IsString()
    slotId: string;

    @IsDefined()
    @IsBoolean()
    status: boolean;
}

export class RemoveScheduleDto {
    @IsDefined()
    @IsString()
    scheduleId: string
}

//* Customer's

export class FetchShcedulesDto {
    @IsDefined()
    @IsString()
    providerId: string;
}
