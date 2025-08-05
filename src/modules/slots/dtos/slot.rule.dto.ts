import { WeekType } from "@core/entities/interfaces/slot-rule.entity.interface";
import { WeekEnum } from "@core/enum/slot-rule.enum";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRuleDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    startDate: string;

    @IsNotEmpty()
    @IsString()
    endDate: string;

    @IsNotEmpty()
    @IsString({ each: true })
    daysOfWeek: WeekType[];

    @IsNotEmpty()
    @IsString()
    startTime: string;

    @IsNotEmpty()
    @IsString()
    endTime: string;

    @IsNotEmpty()
    @IsNumber()
    breakDuration: number;

    @IsNotEmpty()
    @IsNumber()
    slotDuration: number;

    @IsOptional()
    @IsNumber()
    capacity: number;

    @IsBoolean()
    isActive: boolean;

    @IsNumber()
    priority: number;

    @IsString({ each: true })
    excludeDates: string[];
}

export class PageDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    page: number;
}

export class ChangeStatusDto {
    @IsNotEmpty()
    @IsBoolean()
    status: boolean;

    @IsNotEmpty()
    @IsString()
    ruleId: string;
}