import { Request } from 'express';

import {
    BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, Patch, Post,
    Query, Req
} from '@nestjs/common';

import { SCHEDULES_SERVICE_NAME } from '../../../core/constants/service.constant';
import {
    IScheduleDay, IScheduleListWithPagination, ISchedules
} from '../../../core/entities/interfaces/schedules.entity.interface';
import { ErrorMessage } from '../../../core/enum/error.enum';
import { ICustomLogger } from '../../../core/logger/interface/custom-logger.interface';
import {
    ILoggerFactory, LOGGER_FACTORY
} from '../../../core/logger/interface/logger-factory.interface';
import { IPayload } from '../../../core/misc/payload.interface';
import { IResponse } from '../../../core/misc/response.util';
import {
    FetchShcedulesDto, MonthScheduleDto, RemoveScheduleDto, ScheduleDetailsDto,
    ScheduleListFilterDto, UpdateScheduleDateSlotStatusDto, UpdateScheduleDateStatusDto,
    UpdateScheduleStatusDto
} from '../dtos/schedules.dto';
import { ISchedulesService } from '../services/interfaces/schedules-service.interface';

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
    async createSchedule(@Req() req: Request, @Body() dto: MonthScheduleDto): Promise<IResponse> {
        try {
            const user = req.user as IPayload;

            if (!user.sub) {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._schedulesService.createSchedules(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error saving the schedule: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR)
        }
    }

    @Get('')
    async fetchSchedules(@Query() dto: FetchShcedulesDto): Promise<IResponse<ISchedules[]>> {
        try {
            if (!dto.providerId) {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._schedulesService.fetchSchedules(dto.providerId);
        } catch (err) {
            this.logger.error(`Error fetching the schedules: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR)
        }
    }


    @Get('list')
    async fetchScheduleList(@Req() req: Request, @Query() dto: ScheduleListFilterDto): Promise<IResponse<IScheduleListWithPagination>> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._schedulesService.fetchScheduleList(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error fetching the schedule list: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR)
        }
    }

    @Get('details')
    async fetchScheduleDetails(@Req() req: Request, @Query() dto: ScheduleDetailsDto): Promise<IResponse<IScheduleDay[]>> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._schedulesService.fetchScheduleDetails(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error fetching schedule details: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR)
        }
    }

    @Patch('status')
    async toggleScheduleStatus(@Req() req: Request, @Body() dto: UpdateScheduleStatusDto) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            if (typeof dto.status !== 'boolean') {
                throw new BadRequestException(ErrorMessage.INVALID_INPUT);
            }

            return await this._schedulesService.updateScheduleStatus(user.sub, dto);

        } catch (err) {
            this.logger.error(`Error updating schedule status: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR)
        }
    }

    @Patch('date_status')
    async toggleStatus(@Req() req: Request, @Body() dto: UpdateScheduleDateStatusDto) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            if (typeof dto.status !== 'boolean') {
                throw new BadRequestException(ErrorMessage.INVALID_INPUT);
            }

            return await this._schedulesService.updateScheduleDateStatus(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error updating schedule date status: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR)
        }
    }

    @Patch('slot_status')
    async toggleSlotStatus(@Req() req: Request, @Body() dto: UpdateScheduleDateSlotStatusDto) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            if (typeof dto.status !== 'boolean') {
                throw new BadRequestException(ErrorMessage.INVALID_INPUT);
            }

            return await this._schedulesService.updateScheduleDateSlotStatus(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error updating schedule slot status: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR)
        }
    }

    @Patch('remove')
    async removeSchedule(@Req() req: Request, @Body() { scheduleId }: RemoveScheduleDto) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._schedulesService.removeSchedule(user.sub, scheduleId);
        } catch (err) {
            this.logger.error(`Error removing schedule: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR)
        }
    }
}
