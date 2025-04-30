import { Body, Controller, Get, Inject, InternalServerErrorException, Put, Query, Req, UseInterceptors } from "@nestjs/common";
import { AuthInterceptor } from "../../auth/interceptors/auth.interceptor";
import { Request } from "express";
import { IPayload } from "../../../core/misc/payload.interface";
import { SCHEDULE_SERVICE_NAME } from "../../../core/constants/service.constant";
import { IScheduleService } from "../services/interfaces/schedule-service.interface";
import { CreateScheduleDto } from "../dtos/schedule.dto";

@Controller()
@UseInterceptors(AuthInterceptor)
export class ScheduleController {

    constructor(
        @Inject(SCHEDULE_SERVICE_NAME)
        private scheduleService: IScheduleService
    ) { }

    @Get(['provider/schedules'])
    async fetchSchedules(@Req() req: Request, @Query() query: { id: string }) {
        try {
            const user = req.user as IPayload;
            let id = user.sub;
            if (query && query.id) {
                id = query.id;
            }
            return await this.scheduleService.fetchSchedules(id);
        } catch (err) {
            console.error(`Error fetching schedules: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to fetch schedules');
        }
    }

    @Put('provider/schedules')
    async updateSchedule(@Req() req: Request, @Body() dto: CreateScheduleDto) {
        try {
            const user = req.user as IPayload;
            return await this.scheduleService.updateSchedule(user.sub, dto);
        } catch (err) {
            console.error(`Error updating schedules: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to update schedules');
        }
    }
}