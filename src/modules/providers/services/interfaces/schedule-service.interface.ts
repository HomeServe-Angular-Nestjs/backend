import { ISchedule } from "../../../../core/entities/interfaces/schedule.entity.interface";
import { CreateScheduleDto } from "../../dtos/schedule.dto";

export interface IScheduleService {
    fetchSchedules(id: string): Promise<ISchedule[]>;
    updateSchedule(id: string, dto: CreateScheduleDto)
}