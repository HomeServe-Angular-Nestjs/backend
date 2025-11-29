import { Request } from 'express';

import { Body, Controller, Get, Inject, Patch, Post, Query, Req } from '@nestjs/common';
import { IScheduleDay, IScheduleListWithPagination, ISchedules } from '@core/entities/interfaces/schedules.entity.interface';
import { FetchSchedulesDto, MonthScheduleDto, RemoveScheduleDto, ScheduleDetailsDto, ScheduleListFilterDto, UpdateScheduleDateSlotStatusDto, UpdateScheduleDateStatusDto, UpdateScheduleStatusDto } from '@modules/schedules/dtos/schedules.dto';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { SCHEDULES_SERVICE_NAME } from '@core/constants/service.constant';
import { ISchedulesService } from '@modules/schedules/services/interfaces/schedules-service.interface';
import { IResponse } from '@core/misc/response.util';
import { IPayload } from '@core/misc/payload.interface';

@Controller('schedule')
export class SchedulesController {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(SCHEDULES_SERVICE_NAME)
        private readonly _schedulesService: ISchedulesService
    ) {
        this.logger = this.loggerFactory.createLogger(SchedulesController.name);
    }

    @Post('')
    async createSchedule(@Req() req: Request, @Body() monthScheduleDto: MonthScheduleDto): Promise<IResponse> {
        const user = req.user as IPayload;
        return await this._schedulesService.createSchedules(user.sub, monthScheduleDto);
    }

    @Get('')
    async fetchSchedules(@Query() { providerId }: FetchSchedulesDto): Promise<IResponse<ISchedules[]>> {
        return await this._schedulesService.fetchSchedules(providerId);
    }


    @Get('list')
    async fetchScheduleList(@Req() req: Request, @Query() scheduleListFilterDto: ScheduleListFilterDto): Promise<IResponse<IScheduleListWithPagination>> {
        const user = req.user as IPayload;
        return await this._schedulesService.fetchScheduleList(user.sub, scheduleListFilterDto);
    }

    @Get('details')
    async fetchScheduleDetails(@Req() req: Request, @Query() scheduleDetailsDto: ScheduleDetailsDto): Promise<IResponse<IScheduleDay[]>> {
        const user = req.user as IPayload;
        return await this._schedulesService.fetchScheduleDetails(user.sub, scheduleDetailsDto);
    }

    @Patch('status')
    async toggleScheduleStatus(@Req() req: Request, @Body() updateScheduleStatusDto: UpdateScheduleStatusDto) {
        const user = req.user as IPayload;
        return await this._schedulesService.updateScheduleStatus(user.sub, updateScheduleStatusDto);
    }

    @Patch('date_status')
    async toggleStatus(@Req() req: Request, @Body() updateScheduleDateStatusDto: UpdateScheduleDateStatusDto) {
        const user = req.user as IPayload;
        return await this._schedulesService.updateScheduleDateStatus(user.sub, updateScheduleDateStatusDto);
    }

    @Patch('slot_status')
    async toggleSlotStatus(@Req() req: Request, @Body() updateScheduleDateSlotStatusDto: UpdateScheduleDateSlotStatusDto) {
        const user = req.user as IPayload;
        return await this._schedulesService.updateScheduleDateSlotStatus(user.sub, updateScheduleDateSlotStatusDto);
    }

    @Patch('remove')
    async removeSchedule(@Req() req: Request, @Body() { scheduleId }: RemoveScheduleDto) {
        const user = req.user as IPayload;
        return await this._schedulesService.removeSchedule(user.sub, scheduleId);
    }
}
