import { IWeeklyAvailability } from "@core/entities/interfaces/weekly-availability.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { UpdateWeeklyAvailabilityDto } from "@modules/availability/dto/availability.dto";

export interface IAvailabilityService {
    fetchWeeklyAvailability(providerId: string): Promise<IResponse<IWeeklyAvailability>>;
    updateWeeklyAvailability(providerId: string, updateWeeklyAvailabilityDto: UpdateWeeklyAvailabilityDto): Promise<IResponse<IWeeklyAvailability>>;
}