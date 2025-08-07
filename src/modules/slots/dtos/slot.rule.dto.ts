import { WeekType } from "@core/entities/interfaces/slot-rule.entity.interface";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { PartialType } from '@nestjs/mapped-types'

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

export class RuleIdDto {
    @IsNotEmpty()
    @IsString()
    ruleId: string;
}

export class PageDto {
    @Transform(({ value }) => Number(value))
    @IsNumber()
    page: number;
}

export class RuleFilterDto extends PageDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @IsString()
    ruleStatus?: String;

    @IsOptional()
    @IsString()
    sort?: string;
}

export class ChangeStatusDto extends RuleIdDto {
    @IsNotEmpty()
    @IsBoolean()
    status: boolean;
}

export class EditRuleDto extends PartialType(CreateRuleDto) { }