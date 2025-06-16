import { Optional } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateSubServiceDto {
  @IsString()
  title: string;

  @IsString()
  desc: string;

  @IsString()
  price: string;

  @IsString()
  estimatedTime: string;

  @Optional()
  image?: Express.Multer.File;
}

export class CreateServiceDto {
  @IsString()
  title: string;

  @IsString()
  desc: string;

  @Optional()
  image?: Express.Multer.File;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubServiceDto)
  subService?: CreateSubServiceDto[];
}

export class UpdateSubServiceDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  desc: string;

  @IsString()
  price: string;

  @IsString()
  estimatedTime: string;

  @IsNotEmpty()
  image: Express.Multer.File | string;
}

export class UpdateServiceDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  desc: string;

  @IsNotEmpty()
  image: Express.Multer.File | string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSubServiceDto)
  subService: UpdateSubServiceDto[];
}

export class UpdateSubServiceWrapperDto {
  @IsString()
  id: string; // parent service ID

  @ValidateNested()
  @Type(() => UpdateSubServiceDto)
  subService: UpdateSubServiceDto;
}

export class DeleteSubServiceDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsString()
  @IsNotEmpty()
  subId: string
}

export class IPriceRangeDto {
  @IsOptional()
  min?: number;

  @IsOptional()
  max?: number;
}

export class IServiceDurationRangeDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  minHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxHours?: number;
}

export class FilterServiceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['price-asc', 'price-desc', 'duration-asc', 'duration-desc', 'popular'])
  sort?: 'price-asc' | 'price-desc' | 'duration-asc' | 'duration-desc' | 'popular';

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => IPriceRangeDto)
  priceRange?: IPriceRangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => IServiceDurationRangeDto)
  duration?: IServiceDurationRangeDto;
}

export class ToggleServiceStatusDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
export class ToggleSubServiceStatusDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @Type(() => ToggleServiceStatusDto)
  @ValidateNested()
  subService: ToggleServiceStatusDto
}

export class ProviderServiceFilterWithPaginationDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  page: number

  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '') return undefined;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsIn([true, false, 'all'])
  status?: boolean | 'all';

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '') return undefined;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsIn([true, false, 'all'])
  isVerified?: boolean | 'all';

  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsIn(['latest', 'oldest', 'a-z', 'z-a'])
  sort?: 'latest' | 'oldest' | 'a-z' | 'z-a';
}


export class RemoveServiceDto {
  @IsDefined()
  @IsString()
  serviceId: string;
}