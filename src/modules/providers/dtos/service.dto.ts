import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
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

  @IsString()
  tag: string;

  // This will be injected manually in the controller (not part of the body directly)
  @IsOptional()
  imageFile?: Express.Multer.File;
}

export class CreateServiceDto {
  @IsString()
  serviceTitle: string;

  @IsString()
  serviceDesc: string;

  @IsOptional()
  imageFile: Express.Multer.File;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubServiceDto)
  subServices?: CreateSubServiceDto[];
}

export class UpdateSubServiceDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  image?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  image?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSubServiceDto)
  subServices?: UpdateSubServiceDto[];
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
  @IsNumber()
  @Min(0)
  min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
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
  id:string;

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
  @ValidateNested()
  @Type(() => IPriceRangeDto)
  priceRange?: IPriceRangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => IServiceDurationRangeDto)
  duration?: IServiceDurationRangeDto;
}