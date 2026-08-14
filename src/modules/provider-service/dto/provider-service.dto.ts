import { PricingUnitType } from '@core/entities/interfaces/provider-service.entity.interface';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProviderServiceDto {
  @IsString()
  @IsNotEmpty({ message: 'Please select a profession.' })
  professionId: string;

  @IsString()
  @IsNotEmpty({ message: 'Please select a service category.' })
  categoryId: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required.' })
  @MinLength(20, { message: 'Description must be at least 20 characters.' })
  @MaxLength(2000, { message: 'Description must be at most 2000 characters.' })
  description: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a number.' })
  @Min(0, { message: 'Price must be 0 or greater.' })
  @IsNotEmpty({ message: 'Price is required.' })
  price: number;

  @IsIn(['hour', 'day'], { message: 'Pricing unit must be either hour or day.' })
  @IsNotEmpty({ message: 'Pricing unit is required.' })
  pricingUnit: PricingUnitType;

  @Type(() => Number)
  @IsNumber({}, { message: 'Duration must be a number.' })
  @Min(1, { message: 'Duration must be at least 1 minute.' })
  @IsNotEmpty({ message: 'Duration is required.' })
  estimatedTimeInMinutes: number;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return Boolean(value);
  })
  @IsBoolean({ message: 'Active status must be true or false.' })
  @IsNotEmpty({ message: 'Active status is required.' })
  isActive: boolean;
}

export class UpdateProviderServiceDto extends PartialType(CreateProviderServiceDto) {}

export class ProviderServiceFilterDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  sort?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
