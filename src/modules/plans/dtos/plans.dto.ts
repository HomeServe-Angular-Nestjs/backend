import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { PlanDurationType, PlanRoleType } from "src/core/entities/interfaces/plans.entity.interface";

export class CreatePlanDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsString()
    @IsIn(['customer', 'provider'])
    role: PlanRoleType;

    @IsNotEmpty()
    @IsString()
    @IsIn(['monthly', 'yearly', 'lifetime'])
    duration: PlanDurationType;

    @IsArray()
    @IsString({ each: true })
    features: string[];
}

export class UpdatePlanStatusDto {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsBoolean()
    status: boolean;
}