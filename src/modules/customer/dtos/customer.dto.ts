import { IsOptional, IsString } from "class-validator";

export class FilterDto {
    @IsOptional()
    @IsString()
    search: string;
}