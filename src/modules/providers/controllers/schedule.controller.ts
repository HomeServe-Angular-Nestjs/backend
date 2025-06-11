import { BadRequestException, Body, Controller, Delete, Get, Inject, InternalServerErrorException, Logger, Put, Query, Req, UseInterceptors } from "@nestjs/common";

import { Request } from "express";
import { IPayload } from "../../../core/misc/payload.interface";
import { SCHEDULE_SERVICE_NAME } from "../../../core/constants/service.constant";
import { IScheduleService } from "../services/interfaces/schedule-service.interface";
import { RemoveScheduleDto, UpdateScheduleDto } from "../dtos/schedule.dto";

@Controller()
//@UseInterceptors()
export class ScheduleController {
    private readonly logger = new Logger(ScheduleController.name);

    constructor(
        @Inject(SCHEDULE_SERVICE_NAME)
        private _scheduleService: IScheduleService
    ) { }

    /**
   * Fetch schedules for a provider. If a provider ID is passed in the query, fetch schedules for that provider, else fetch schedules for the authenticated user.
   * 
   * @param req - The HTTP request object (contains user data from the authentication token).
   * @param query - The query parameters, specifically the provider ID.
   * @returns An array of schedules for the provider.
   * @throws InternalServerErrorException if an error occurs while fetching schedules.
   */
    @Get(['provider/schedules'])
    async fetchSchedules(@Req() req: Request, @Query() query: { id: string }) {
        try {
            const user = req.user as IPayload;
            let id = user.sub;
            if (query && query.id) {
                id = query.id;
            }
            return await this._scheduleService.fetchSchedules(id);
        } catch (err) {
            this.logger.error(`Error fetching schedules: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to fetch schedules');
        }
    }

    /**
    * Update a schedule for a given provider.
    * 
    * @param req - The HTTP request object (contains user data from the authentication token).
    * @param dto - The Data Transfer Object (DTO) containing the updated schedule details.
    * @returns The updated schedule information.
    * @throws InternalServerErrorException if an error occurs while updating the schedule.
    */
    @Put('provider/schedules')
    async updateSchedule(@Req() req: Request, @Body() dto: UpdateScheduleDto) {
        try {
            const user = req.user as IPayload;
            return await this._scheduleService.updateSchedule(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error updating schedules: ${err.message}`, err.stack);
            throw new InternalServerErrorException(err.message);
        }
    }

    @Delete('provider/schedule')
    async removeSchedule(@Req() req: Request, @Query() dto: RemoveScheduleDto) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException('Provider authentication failed');
            }

            if (dto.date === 'undefined' || dto.id === 'undefined') {
                throw new BadRequestException('Invalid parameters received');
            }

            return await this._scheduleService.removeSchedule(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error removing schedule: ${err.message}`, err.stack);
            throw new InternalServerErrorException(err.message);
        }
    }
}