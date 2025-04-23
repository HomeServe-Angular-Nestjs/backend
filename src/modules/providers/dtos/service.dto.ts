import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
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
  @IsString()
  image?: string;

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
  @IsString()
  image?: string;

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
  @IsDateString()
  createdAt?: Date;

  @IsOptional()
  @IsDateString()
  updatedAt?: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSubServiceDto)
  subService?: UpdateSubServiceDto[];
}

export class UpdateSubServiceWrapperDto {
  @IsString()
  id: string; // parent service ID

  @ValidateNested()
  @Type(() => UpdateSubServiceDto)
  subService: UpdateSubServiceDto;
}
