import { Transform } from "class-transformer";
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateSavedProvidersDto {
    @IsNotEmpty()
    @IsString()
    providerId: string;
}