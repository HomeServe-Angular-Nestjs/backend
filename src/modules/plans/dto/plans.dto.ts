import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsObject, IsString, Min } from 'class-validator';

import { PlanDurationEnum, PlanRoleEnum } from '@core/enum/subscription.enum';
import { PlanFeatures } from '@core/entities/interfaces/plans.entity.interface';

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
    @IsIn(Object.values(PlanDurationEnum))
    duration: PlanDurationEnum;

    @IsNotEmpty()
    @IsObject()
    features: PlanFeatures;
}

export class UpdatePlanDto extends SavePlanDto {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsBoolean()
    isDeleted?: boolean;
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

