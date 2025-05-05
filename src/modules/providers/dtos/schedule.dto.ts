import { Type } from "class-transformer";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { ISchedule } from "../../../core/entities/interfaces/schedule.entity.interface";
import { IProvider } from "../../../core/entities/interfaces/user.entity.interface";

class SlotDto {
    @IsNotEmpty()
    @IsString()
    from: string;

    @IsNotEmpty()
    @IsString()
    to: string;
}

export class UpdateScheduleDto {
    @IsNotEmpty()
    @IsString()
    scheduleDate: string;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => SlotDto)
    slot: SlotDto
}

export class UpdateScheduleResponseDto {
    schedule: ISchedule;
    provider: IProvider;
}

export class RemoveScheduleDto {
    @IsNotEmpty()
    @IsString()
    date: string;

    @IsString()
    id: string;
}