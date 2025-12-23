import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
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
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class CreateServiceCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsString()
    professionId: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    keywords?: string[];

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
