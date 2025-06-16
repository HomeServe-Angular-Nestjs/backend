import { IResponse } from "src/core/misc/response.util";
import { MonthScheduleDto, ScheduleDetailsDto, ScheduleListFilterDto, UpdateScheduleDateSlotStatusDto, UpdateScheduleDateStatusDto, UpdateScheduleStatusDto } from "../../dtos/schedules.dto";
import { IScheduleDay, IScheduleList, IScheduleListWithPagination, ISchedules } from "src/core/entities/interfaces/schedules.entity.interface";

export interface ISchedulesService {
    createSchedules(providerId: string, dto: MonthScheduleDto): Promise<IResponse>;
    fetchSchedules(providerId: string): Promise<IResponse<ISchedules[]>>;
    fetchScheduleList(providerId: string, dto: ScheduleListFilterDto): Promise<IResponse<IScheduleListWithPagination>>;
    fetchScheduleDetails(providerId: string, dto: ScheduleDetailsDto): Promise<IResponse<IScheduleDay[]>>;
    updateScheduleStatus(providerId: string, dto: UpdateScheduleStatusDto): Promise<IResponse>;
    updateScheduleDateStatus(providerId: string, dto: UpdateScheduleDateStatusDto): Promise<IResponse<IScheduleDay[]>>;
    updateScheduleDateSlotStatus(providerId: string, dto: UpdateScheduleDateSlotStatusDto): Promise<IResponse<IScheduleDay[]>>
    removeSchedule(providerId: string, scheduleId: string): Promise<IResponse>;
}