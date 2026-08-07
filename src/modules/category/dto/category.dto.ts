import { ArrayMaxSize, IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class CategoryFilterDto {
    @IsString()
    @IsOptional()
    search?: string;

    @IsString()
    @IsOptional()
    isActive?: string;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value) || 1)
    page?: number;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value) || 10)
    limit?: number;
}

export class CategoryServiceFilterDto extends CategoryFilterDto {
    @IsString()
    @IsOptional()
    profession?: string;
}

export class CreateProfessionDto {
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString({ message: 'Profession name must be a string.' })
    @IsNotEmpty({ message: 'Profession name is required.' })
    @MinLength(3, { message: 'Profession name must be at least 3 characters.' })
    @MaxLength(50, { message: 'Profession name cannot exceed 50 characters.' })
    name: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class CreateServiceCategoryDto {
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString({ message: 'Service name must be a string.' })
    @IsNotEmpty({ message: 'Service name is required.' })
    @MinLength(3, { message: 'Service name must be at least 3 characters.' })
    @MaxLength(50, { message: 'Service name cannot exceed 50 characters.' })
    name: string;

    @IsString({ message: 'Profession id must be a string.' })
    @IsNotEmpty({ message: 'Profession is required.' })
    professionId: string;

    @Transform(({ value }) => Array.isArray(value) ? value.map((item: unknown) => typeof item === 'string' ? item.trim() : item) : value)
    @IsArray({ message: 'Keywords must be an array.' })
    @IsString({ each: true, message: 'Each keyword must be a string.' })
    @MaxLength(30, { each: true, message: 'Each keyword cannot exceed 30 characters.' })
    @ArrayMaxSize(20, { message: 'Keywords cannot exceed 20 items.' })
    @IsOptional()
    keywords?: string[];

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
