import { ReportedType } from "@core/entities/interfaces/report.entity.interface";
import { ReportStatus } from "@core/enum/report.enum";
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

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

export class ReportStatusDto {
    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(ReportStatus))
    status: ReportStatus;
}

export class ReportFilterDto {
    @IsOptional()
    @IsNumber()
    page: number;

    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    status: ReportStatus;

    @IsOptional()
    @IsString()
    type: ReportedType;
}