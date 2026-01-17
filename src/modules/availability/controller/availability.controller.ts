import { User } from "@core/decorators/extract-user.decorator";
import { IPayload } from "@core/misc/payload.interface";
import { Body, Controller, Delete, Get, Inject, Post, Put, Query } from "@nestjs/common";
import { IAvailabilityService } from "@modules/availability/services/interface/availability-service.interface";
import { AVAILABILITY_SERVICE_NAME } from "@core/constants/service.constant";
import { IWeeklyAvailability } from "@core/entities/interfaces/weekly-availability.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { CreateDateOverrideDto, DateDto, UpdateWeeklyAvailabilityDto } from "@modules/availability/dto/availability.dto";
import { IDateOverride } from "@core/entities/interfaces/date-override.entity.interface";

@Controller('availability')
export class AvailabilityController {
    constructor(
        @Inject(AVAILABILITY_SERVICE_NAME)
        private readonly _availabilityService: IAvailabilityService,
    ) { }

    @Get('')
    async fetchWeeklyAvailability(@User() user: IPayload): Promise<IResponse<IWeeklyAvailability>> {
        return await this._availabilityService.fetchWeeklyAvailability(user.sub);
    }

    @Get('overrides')
    async fetchDateOverrides(@User() user: IPayload): Promise<IResponse<IDateOverride[]>> {
        return await this._availabilityService.fetchDateOverrides(user.sub);
    }

    @Put('')
    async updateWeeklyAvailability(@User() user: IPayload, @Body() updateWeeklyAvailabilityDto: UpdateWeeklyAvailabilityDto): Promise<IResponse<IWeeklyAvailability>> {
        return await this._availabilityService.updateWeeklyAvailability(user.sub, updateWeeklyAvailabilityDto);
    }

    @Post('overrides')
    async createDateOverrides(@User() user: IPayload, @Body() createDateOverrideDto: CreateDateOverrideDto): Promise<IResponse<IDateOverride>> {
        return await this._availabilityService.createDateOverride(user.sub, createDateOverrideDto);
    }

    @Delete('overrides')
    async deleteDateOverrides(@User() user: IPayload, @Query() { date }: DateDto): Promise<IResponse> {
        return await this._availabilityService.deleteDateOverride(user.sub, date);
    }
}
