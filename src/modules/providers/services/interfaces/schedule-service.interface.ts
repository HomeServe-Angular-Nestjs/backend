import { ISchedule } from "../../../../core/entities/interfaces/schedule.entity.interface";
import { RemoveScheduleDto, UpdateScheduleDto, UpdateScheduleResponseDto } from "../../dtos/schedule.dto";

export interface IScheduleService {
    fetchSchedules(id: string): Promise<ISchedule[]>;
    updateSchedule(id: string, dto: UpdateScheduleDto): Promise<UpdateScheduleResponseDto>;
    removeSchedule(id: string, dto: RemoveScheduleDto): Promise<string>
}