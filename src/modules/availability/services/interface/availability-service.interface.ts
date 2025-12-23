import { IDateOverride } from "@core/entities/interfaces/date-override.entity.interface";
import { IWeeklyAvailability } from "@core/entities/interfaces/weekly-availability.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { CreateDateOverrideDto, UpdateWeeklyAvailabilityDto } from "@modules/availability/dto/availability.dto";

export interface IAvailabilityService {
    fetchWeeklyAvailability(providerId: string): Promise<IResponse<IWeeklyAvailability>>;
    updateWeeklyAvailability(providerId: string, updateWeeklyAvailabilityDto: UpdateWeeklyAvailabilityDto): Promise<IResponse<IWeeklyAvailability>>;
    fetchDateOverrides(providerId: string): Promise<IResponse<IDateOverride[]>>;
    createDateOverride(providerId: string, dateOverrideDto: CreateDateOverrideDto): Promise<IResponse<IDateOverride>>;
    deleteDateOverride(providerId: string, date: string): Promise<IResponse>;
}