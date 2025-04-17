import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateSubServiceDto {
    @IsString()
    title: string;

    @IsString()
    desc: string;

    // This will be injected manually in the controller (not part of the body directly)
    @IsOptional()
    imageFile?: Express.Multer.File;
}

export class CreateServiceDto {
    @IsString()
    serviceTitle: string;

    @IsString()
    serviceDesc: string;

    // This will be attached manually in the controller like sub-service images
    imageFile?: Express.Multer.File;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSubServiceDto)
    subServices: CreateSubServiceDto[];
}