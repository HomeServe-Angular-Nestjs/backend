import { AVAILABILITY_MAPPER } from "@core/constants/mappers.constant";
import { DATE_OVERRIDES_REPOSITORY_NAME, WEEKLY_AVAILABILITY_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { TIME_UTILITY_NAME } from "@core/constants/utility.constant";
import { IAvailabilityMapper } from "@core/dto-mapper/interface/availability.mapper.interface";
import { IDateOverride } from "@core/entities/interfaces/date-override.entity.interface";
import { IDayAvailability, IWeeklyAvailability } from "@core/entities/interfaces/weekly-availability.entity.interface";
import { ErrorCodes } from "@core/enum/error.enum";
import { IResponse } from "@core/misc/response.util";
import { IDateOverridesRepository } from "@core/repositories/interfaces/date-overrides.repo.interface";
import { IWeeklyAvailabilityRepository } from "@core/repositories/interfaces/weekly-availability-repo.interface";
import { ITimeUtility } from "@core/utilities/interface/time.utility.interface";
import { CreateDateOverrideDto, UpdateWeeklyAvailabilityDto } from "@modules/availability/dto/availability.dto";
import { IAvailabilityService } from "@modules/availability/services/interface/availability-service.interface";
import { BadRequestException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class AvailabilityService implements IAvailabilityService {
    constructor(
        @Inject(WEEKLY_AVAILABILITY_REPOSITORY_NAME)
        private readonly _weeklyAvailabilityRepository: IWeeklyAvailabilityRepository,
        @Inject(AVAILABILITY_MAPPER)
        private readonly _availabilityMapper: IAvailabilityMapper,
        @Inject(TIME_UTILITY_NAME)
        private readonly _timeUtility: ITimeUtility,
        @Inject(DATE_OVERRIDES_REPOSITORY_NAME)
        private readonly _dateOverrideRepository: IDateOverridesRepository,
    ) { }

    private _validateWeeklyAvailability(week: IWeeklyAvailability['week']): void {
        for (const [dayName, day] of Object.entries(week)) {
            this._validateDayAvailability(day, dayName);
        }
    }

    private _validateDayAvailability(day: IDayAvailability, dayName?: string,): void {
        const { timeRanges } = day;

        // Convert to intervals in minutes
        const intervals = timeRanges.map(slot => {
            const start = this._timeUtility.timeToMinutes(slot.startTime);
            const end = this._timeUtility.timeToMinutes(slot.endTime);

            // Rule 1: start < end
            if (start >= end) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: dayName
                        ? `${dayName}: startTime must be before endTime`
                        : 'startTime must be before endTime',
                });
            }

            return [start, end] as [number, number];
        });

        // Rule 2: no overlaps
        intervals.sort((a, b) => a[0] - b[0]);

        for (let i = 1; i < intervals.length; i++) {
            const prevEnd = intervals[i - 1][1];
            const currStart = intervals[i][0];

            if (currStart < prevEnd) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: dayName
                        ? `${dayName}: time ranges must not overlap`
                        : 'time ranges must not overlap',
                });
            }
        }
    }

    async fetchWeeklyAvailability(providerId: string): Promise<IResponse<IWeeklyAvailability>> {
        const weeklyAvailabilityDoc = await this._weeklyAvailabilityRepository.findOneByProviderId(providerId);
        return {
            success: true,
            message: 'Weekly availability fetched successfully',
            data: this._availabilityMapper.toWeeklyAvailabilityEntity(weeklyAvailabilityDoc),
        }
    }

    async updateWeeklyAvailability(providerId: string, updateWeeklyAvailabilityDto: UpdateWeeklyAvailabilityDto): Promise<IResponse<IWeeklyAvailability>> {
        this._validateWeeklyAvailability(updateWeeklyAvailabilityDto.week);
        const updated = await this._weeklyAvailabilityRepository.updateWeekByProviderId(providerId, updateWeeklyAvailabilityDto.week);
        return {
            success: true,
            message: 'Weekly availability updated successfully',
            data: this._availabilityMapper.toWeeklyAvailabilityEntity(updated),
        }
    }

    async fetchDateOverrides(providerId: string): Promise<IResponse<IDateOverride[]>> {
        const dateOverridesDoc = await this._dateOverrideRepository.fetchOverridesByProviderId(providerId);
        const overrides = dateOverridesDoc
            .map(override => this._availabilityMapper.toDateOverrideEntity(override))

        return {
            success: true,
            message: 'Date overrides fetched successfully',
            data: overrides,
        }
    }

    async createDateOverride(providerId: string, dateOverrideDto: CreateDateOverrideDto): Promise<IResponse<IDateOverride>> {
        const isValidOverrideDate = await this._dateOverrideRepository.isValidOverrideDate(providerId, new Date(dateOverrideDto.date));
        if (isValidOverrideDate) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: 'Date override already exists or Invalid date',
        });

        dateOverrideDto.timeRanges.forEach(timeRange => {
            const dayAvailability: IDayAvailability = {
                isAvailable: dateOverrideDto.isAvailable,
                timeRanges: [timeRange],
            };
            this._validateDayAvailability(dayAvailability);
        });

        const overrideDoc = this._availabilityMapper.toDateOverrideDocument({
            date: new Date(dateOverrideDto.date),
            timeRanges: dateOverrideDto.timeRanges,
            isAvailable: dateOverrideDto.isAvailable,
            reason: dateOverrideDto.reason,
            providerId,
        });

        const createdDoc = await this._dateOverrideRepository.createOverride(providerId, overrideDoc);
        return {
            success: true,
            message: 'Date override created successfully',
            data: this._availabilityMapper.toDateOverrideEntity(createdDoc),
        }
    }

    async deleteDateOverride(providerId: string, date: string): Promise<IResponse> {
        const dateSent = new Date(date);
        dateSent.setHours(0, 0, 0, 0);

        const isDeleted = await this._dateOverrideRepository.deleteOneByProviderIdAndDate(providerId, dateSent);

        if (!isDeleted) throw new InternalServerErrorException({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: 'Date override deleted failed',
        })

        return {
            success: true,
            message: 'Date override deleted successfully',
        }
    }
}