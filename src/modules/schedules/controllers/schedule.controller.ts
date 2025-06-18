import { BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, Logger, Patch, Post, Query, Req } from "@nestjs/common";
import { FetchShcedulesDto, MonthScheduleDto, RemoveScheduleDto, ScheduleDetailsDto, ScheduleListFilterDto, UpdateScheduleDateSlotStatusDto, UpdateScheduleDateStatusDto, UpdateScheduleStatusDto } from "../dtos/schedules.dto";
import { IPayload } from "src/core/misc/payload.interface";
import { Request } from "express";
import { SCHEDULES_SERVICE_NAME } from "src/core/constants/service.constant";
import { ISchedulesService } from "../services/interfaces/schedules-service.interface";
import { IResponse } from "src/core/misc/response.util";
import { IScheduleDay, IScheduleListWithPagination, ISchedules } from "src/core/entities/interfaces/schedules.entity.interface";

@Controller('schedule')
export class SchedulesController {
    private readonly logger = new Logger(SchedulesController.name);

    constructor(
        @Inject(SCHEDULES_SERVICE_NAME)
        private readonly _schedulesService: ISchedulesService
    ) { }

    @Post('')
    async createSchedule(@Req() req: Request, @Body() dto: MonthScheduleDto): Promise<IResponse> {
        try {
            const user = req.user as IPayload;

            if (!user.sub) {
                throw new BadRequestException('Provider id is missing');
            }

            return await this._schedulesService.createSchedules(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error saving the schedule: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Error while saving schedules');
        }
    }

    @Get('')
    async fetchSchedules(@Query() dto: FetchShcedulesDto): Promise<IResponse<ISchedules[]>> {
        try {
            if (!dto.providerId) {
                throw new BadRequestException('provider id is missing.');
            }

            return await this._schedulesService.fetchSchedules(dto.providerId);
        } catch (err) {
            this.logger.error(`Error fetching the schedules: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Error while fetching schedules');
        }
    }


    @Get('list')
    async fetchScheduleList(@Req() req: Request, @Query() dto: ScheduleListFilterDto): Promise<IResponse<IScheduleListWithPagination>> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException('Provider id is missing');
            }

            return await this._schedulesService.fetchScheduleList(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error fetching the schedule list: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Error while fetching schedule list.');
        }
    }

    @Get('details')
    async fetchScheduleDetails(@Req() req: Request, @Query() dto: ScheduleDetailsDto): Promise<IResponse<IScheduleDay[]>> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException('Provider id is missing');
            }

            return await this._schedulesService.fetchScheduleDetails(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error fetching schedule details: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Error while fetching schedule details');
        }
    }

    @Patch('status')
    async toggleScheduleStatus(@Req() req: Request, @Body() dto: UpdateScheduleStatusDto) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException('Provider id is missing');
            }

            if (typeof dto.status !== 'boolean') {
                throw new BadRequestException('Invalid status value');
            }

            return await this._schedulesService.updateScheduleStatus(user.sub, dto);

        } catch (err) {
            this.logger.error(`Error updating schedule status: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Error while updating schedule details');
        }
    }

    @Patch('date_status')
    async toggleStatus(@Req() req: Request, @Body() dto: UpdateScheduleDateStatusDto) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException('Provider id is missing');
            }

            if (typeof dto.status !== 'boolean') {
                throw new BadRequestException('Invalid status value');
            }

            return await this._schedulesService.updateScheduleDateStatus(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error updating schedule date status: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Error while updating schedule date details');
        }
    }

    @Patch('slot_status')
    async toggleSlotStatus(@Req() req: Request, @Body() dto: UpdateScheduleDateSlotStatusDto) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException('Provider id is missing');
            }

            if (typeof dto.status !== 'boolean') {
                throw new BadRequestException('Invalid status value');
            }

            return await this._schedulesService.updateScheduleDateSlotStatus(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error updating schedule slot status: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Error while updating schedule slot status');
        }
    }

    @Patch('remove')
    async removeSchedule(@Req() req: Request, @Body() { scheduleId }: RemoveScheduleDto) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException('Provider id is missing');
            }

            return await this._schedulesService.removeSchedule(user.sub, scheduleId);
        } catch (err) {
            this.logger.error(`Error removing schedule: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Error while removing schedule.');
        }
    }
}