import { User } from "@core/decorators/extract-user.decorator";
import { IPayload } from "@core/misc/payload.interface";
import { Body, Controller, Get, Inject, Post, Put } from "@nestjs/common";
import { IAvailabilityService } from "@modules/availability/services/interface/availability-service.interface";
import { AVAILABILITY_SERVICE_NAME } from "@core/constants/service.constant";
import { IWeeklyAvailability } from "@core/entities/interfaces/weekly-availability.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { UpdateWeeklyAvailabilityDto } from "@modules/availability/dto/availability.dto";

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

    @Put('')
    async updateWeeklyAvailability(@User() user: IPayload, @Body() updateWeeklyAvailabilityDto: UpdateWeeklyAvailabilityDto): Promise<IResponse<IWeeklyAvailability>> {
        return await this._availabilityService.updateWeeklyAvailability(user.sub, updateWeeklyAvailabilityDto);
    }
}
