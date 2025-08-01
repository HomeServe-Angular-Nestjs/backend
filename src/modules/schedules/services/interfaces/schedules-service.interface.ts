import {
    IScheduleDay, IScheduleListWithPagination, ISchedules
} from '@core/entities/interfaces/schedules.entity.interface';
import { IResponse } from '@core/misc/response.util';
import {
    MonthScheduleDto, ScheduleDetailsDto, ScheduleListFilterDto, UpdateScheduleDateSlotStatusDto,
    UpdateScheduleDateStatusDto, UpdateScheduleStatusDto
} from '@modules/schedules/dtos/schedules.dto';

export interface ISchedulesService {
    createSchedules(providerId: string, dto: MonthScheduleDto): Promise<IResponse>;
    fetchSchedules(providerId: string): Promise<IResponse<ISchedules[]>>;
    fetchScheduleList(providerId: string, dto: ScheduleListFilterDto): Promise<IResponse<IScheduleListWithPagination>>;
    fetchScheduleDetails(providerId: string, dto: ScheduleDetailsDto): Promise<IResponse<IScheduleDay[]>>;
    updateScheduleStatus(providerId: string, dto: UpdateScheduleStatusDto): Promise<IResponse>;
    updateScheduleDateStatus(providerId: string, dto: UpdateScheduleDateStatusDto): Promise<IResponse<IScheduleDay[]>>;
    updateScheduleDateSlotStatus(providerId: string, dto: UpdateScheduleDateSlotStatusDto): Promise<IResponse>
    removeSchedule(providerId: string, scheduleId: string): Promise<IResponse>;
}