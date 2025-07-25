import { Types } from 'mongoose';

import {
    PROVIDER_REPOSITORY_INTERFACE_NAME, SCHEDULES_REPOSITORY_NAME
} from '@core/constants/repository.constant';
import {
    IScheduleDay, IScheduleList, IScheduleListWithPagination, ISchedules
} from '@core/entities/interfaces/schedules.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IResponse } from '@core/misc/response.util';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { ISchedulesRepository } from '@core/repositories/interfaces/schedules-repo.interface';
import {
    MonthScheduleDto, ScheduleDetailsDto, ScheduleListFilterDto, UpdateScheduleDateSlotStatusDto,
    UpdateScheduleDateStatusDto, UpdateScheduleStatusDto
} from '@modules/schedules/dtos/schedules.dto';
import {
    ISchedulesService
} from '@modules/schedules/services/interfaces/schedules-service.interface';
import {
    Inject, Injectable, InternalServerErrorException, NotFoundException
} from '@nestjs/common';

@Injectable()
export class SchedulesService implements ISchedulesService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(SCHEDULES_REPOSITORY_NAME)
        private readonly _schedulesRepository: ISchedulesRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository
    ) {
        this.logger = this.loggerFactory.createLogger(SchedulesService.name);
    }

    async createSchedules(providerId: string, dto: MonthScheduleDto): Promise<IResponse> {
        const providerExists = await this._providerRepository.isExists({ _id: providerId });
        if (!providerExists) {
            throw new NotFoundException(`Provider with ID ${providerId} not found.`);
        }

        const existingSchedule = await this._schedulesRepository.findOne({
            providerId,
            month: dto.month
        });

        const sanitizedDays: IScheduleDay[] = dto.days.map(day => ({
            date: day.date,
            slots: day.slots.map(slot => ({
                from: slot.from,
                to: slot.to,
                takenBy: slot.takenBy ?? null,
                isActive: true,
            })),
            isActive: true,
        }));

        if (!existingSchedule) {
            try {
                await this._schedulesRepository.create({
                    providerId,
                    month: dto.month,
                    days: sanitizedDays,
                    isActive: true,
                    isDeleted: false
                });
            } catch (err) {
                this.logger.error('Error creating a schedule: ', err.message, err.stack);
                throw new InternalServerErrorException('Something happened while creating new schedule')
            }

            return {
                success: true,
                message: 'Schedule saved successfully',
            };
        }

        const existingDates = new Set(existingSchedule.days.map(d => d.date));

        const duplicateDates = sanitizedDays.reduce<string[]>((acc, day) => {
            if (existingDates.has(day.date)) {
                acc.push(day.date);
            }
            return acc;
        }, []);

        if (duplicateDates.length > 0) {
            return {
                success: false,
                message: `Schedule already exists for dates`,
                data: duplicateDates
            };
        }

        try {
            // Only push new unique days
            await this._schedulesRepository.findOneAndUpdate(
                {
                    providerId,
                    month: dto.month
                },
                {
                    $push: {
                        days: { $each: sanitizedDays }
                    }
                }
            );
        } catch (err) {
            this.logger.error('Error updating schedule: ', err.message, err.stack);
            throw new InternalServerErrorException('Something went wrong while updating the schedule');
        }

        return {
            success: true,
            message: 'Schedule updated successfully',
        };
    }

    async fetchSchedules(providerId: string): Promise<IResponse<ISchedules[]>> {
        const schedules = await this._schedulesRepository.find({ providerId });
        if (!schedules) {
            throw new NotFoundException(`Schedules with provider ID ${providerId} not found`);
        }

        return {
            success: true,
            message: 'schedules fetched',
            data: schedules
        }
    }

    async fetchScheduleList(providerId: string, dto: ScheduleListFilterDto): Promise<IResponse<IScheduleListWithPagination>> {
        const limit = 10;
        const skip = (dto.page - 1) * limit;

        const filter = { providerId, isDeleted: false };

        const [fetchedSchedules, total] = await Promise.all([
            this._schedulesRepository.find(filter, { skip, limit, sort: { createdAt: -1 } }),
            this._schedulesRepository.count({ providerId })
        ]);

        if (!fetchedSchedules) {
            return {
                success: true,
                message: 'Schedule list fetched successfully',
                data: {
                    scheduleList: [],
                    pagination: { page: dto.page, limit: 0, total: 0 }
                }
            }
        }

        const responseSchedules: IScheduleList[] = fetchedSchedules.map(schedule => ({
            id: schedule.id,
            createdAt: schedule.createdAt as Date,
            isActive: schedule.isActive,
            month: schedule.month,
            totalDays: schedule.days.length,
        }));

        return {
            success: true,
            message: 'Schedule list fetched successfully',
            data: {
                scheduleList: responseSchedules,
                pagination: { page: dto.page, limit, total }
            }
        }
    }

    async fetchScheduleDetails(providerId: string, dto: ScheduleDetailsDto): Promise<IResponse<IScheduleDay[]>> {
        const schedule = await this._schedulesRepository.findOne({
            _id: dto.id,
            providerId,
            month: dto.month
        });

        if (!schedule) {
            return {
                success: true,
                message: 'No schedule found.',
                data: []
            };
        }

        let filteredDays = schedule.days;

        if (dto.date && dto.date) {
            filteredDays = filteredDays.filter(day => day.date === dto.date);
        }

        if (dto.status && dto.status !== 'all') {
            const isActive = dto.status === 'true';
            filteredDays = filteredDays.filter(day => day.isActive === isActive);
        }

        if (dto.availableType && dto.availableType !== 'all') {
            filteredDays = filteredDays
                .map(day => ({
                    ...day,
                    slots: day.slots.filter(s =>
                        dto.availableType === 'booked' ? s.takenBy : !s.takenBy
                    )
                }))
                .filter(day => day.slots.length > 0);
        }

        return {
            success: true,
            message: 'schedule fetched successfully.',
            data: filteredDays
        }
    }

    async updateScheduleStatus(providerId: string, dto: UpdateScheduleStatusDto): Promise<IResponse> {
        const schedule = await this._schedulesRepository.findOneAndUpdate(
            {
                _id: dto.scheduleId,
                providerId
            },
            {
                $set: {
                    isActive: dto.status
                }
            },
            { new: true }
        );

        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }

        return {
            success: true,
            message: 'Status updated'
        }
    }

    async updateScheduleDateStatus(providerId: string, dto: UpdateScheduleDateStatusDto): Promise<IResponse<IScheduleDay[]>> {
        const scheduleId = new Types.ObjectId(dto.scheduleId);
        const dayId = new Types.ObjectId(dto.dayId);

        const schedule = await this._schedulesRepository.findOneAndUpdate(
            {
                _id: scheduleId,
                providerId,
                'days._id': dayId
            },
            {
                $set: {
                    'days.$.isActive': dto.status
                }
            },
            { new: true }
        );

        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }

        return {
            success: true,
            message: 'Status updated',
            data: schedule.days
        }
    }

    // TODO - slot status update.
    async updateScheduleDateSlotStatus(providerId: string, dto: UpdateScheduleDateSlotStatusDto): Promise<IResponse> {
        const { scheduleId, dayId, slotId, status } = dto;



        return {
            message: 'Slot status updated successfully',
            success: true,
        };
    }


    async removeSchedule(providerId: string, scheduleId: string): Promise<IResponse> {
        const schedule = await this._schedulesRepository.findOneAndUpdate(
            {
                _id: scheduleId,
                providerId
            },
            {
                $set: {
                    isDeleted: true
                }
            }
        );

        if (!schedule) {
            throw new NotFoundException('Schedule not found');
        }

        return {
            success: true,
            message: 'Schedule Deleted'
        }
    }
}
