import { PricingUnitType } from "@core/entities/interfaces/provider-service.entity.interface";
import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import { Type, Transform } from 'class-transformer';

export class CreateProviderServiceDto {
    @IsString()
    @IsNotEmpty()
    professionId: string;

    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsIn(['hour', 'day'])
    @IsNotEmpty()
    pricingUnit: PricingUnitType;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    estimatedTimeInMinutes: number;

    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return Boolean(value);
    })
    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;
}

export class UpdateProviderServiceDto extends CreateProviderServiceDto {
    @IsNotEmpty()
    @IsString()
    id: string;
}