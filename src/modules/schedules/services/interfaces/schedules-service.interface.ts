import { IScheduleDay, IScheduleListWithPagination, ISchedules } from '@core/entities/interfaces/schedules.entity.interface';
import { IResponse } from '@core/misc/response.util';
import { MonthScheduleDto, ScheduleDetailsDto, ScheduleListFilterDto, UpdateScheduleDateSlotStatusDto, UpdateScheduleDateStatusDto, UpdateScheduleStatusDto } from '@modules/schedules/dtos/schedules.dto';

export interface ISchedulesService {
    createSchedules(providerId: string, monthScheduleDto: MonthScheduleDto): Promise<IResponse>;
    fetchSchedules(providerId: string): Promise<IResponse<ISchedules[]>>;
    fetchScheduleList(providerId: string, scheduleListFilterDto: ScheduleListFilterDto): Promise<IResponse<IScheduleListWithPagination>>;
    fetchScheduleDetails(providerId: string, scheduleDetailsDto: ScheduleDetailsDto): Promise<IResponse<IScheduleDay[]>>;
    updateScheduleStatus(providerId: string, updateScheduleStatusDto: UpdateScheduleStatusDto): Promise<IResponse>;
    updateScheduleDateStatus(providerId: string, updateScheduleDateStatusDto: UpdateScheduleDateStatusDto): Promise<IResponse<IScheduleDay[]>>;
    updateScheduleDateSlotStatus(providerId: string, updateScheduleDateSlotStatusDto: UpdateScheduleDateSlotStatusDto): Promise<IResponse>
    removeSchedule(providerId: string, scheduleId: string): Promise<IResponse>;
}