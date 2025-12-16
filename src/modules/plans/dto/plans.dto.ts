import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

import { PlanDurationType } from '@core/entities/interfaces/plans.entity.interface';
import { PlanRoleEnum } from '@core/enum/subscription.enum';

export class SavePlanDto {
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    name: string;

    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @Min(0)
    price: number;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(PlanRoleEnum))
    role: PlanRoleEnum;

    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean;

    @IsNotEmpty()
    @IsString()
    @IsIn(['monthly', 'yearly', 'lifetime'])
    duration: PlanDurationType;

    @IsArray()
    @IsString({ each: true })
    features: string[];
}

export class UpdatePlanDto extends SavePlanDto {
    @IsNotEmpty()
    @IsString()
    id: string;
}

export class UpdatePlanStatusDto {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsBoolean()
    status: boolean;
}

export class GetOnePlanDto {
    @IsNotEmpty()
    @IsString()
    planId: string;
}

