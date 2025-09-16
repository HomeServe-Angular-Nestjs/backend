import { IsNotEmpty, IsString } from "class-validator";

export class ReportSubmitDto {
    @IsNotEmpty()
    @IsString()
    reason: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    targetId: string;
}