import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { IScheduleService } from "../interfaces/schedule-service.interface";
import { ISchedule } from "../../../../core/entities/interfaces/schedule.entity.interface";
import { PROVIDER_REPOSITORY_INTERFACE_NAME, SCHEDULE_REPOSITORY_NAME } from "../../../../core/constants/repository.constant";
import { IScheduleRepository } from "../../../../core/repositories/interfaces/schedule-repo.interface";
import { IProviderRepository } from "../../../../core/repositories/interfaces/provider-repo.interface";
import { Connection, Types } from "mongoose";
import { RemoveScheduleDto, UpdateScheduleDto, UpdateScheduleResponseDto } from "../../dtos/schedule.dto";
import { InjectConnection } from "@nestjs/mongoose";

@Injectable()
export class ScheduleService implements IScheduleService {
    private readonly logger = new Logger(ScheduleService.name);

    constructor(
        @Inject(SCHEDULE_REPOSITORY_NAME)
        private _scheduleRepository: IScheduleRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private _providerRepository: IProviderRepository
    ) { }

    /**
    * Fetches the schedules of a provider by their ID.
    * 
    * @param id - The provider's unique identifier (string).
    * @returns An array of schedules related to the provider.
    * @throws BadRequestException if no ID is provided.
    * @throws NotFoundException if the provider or its schedules cannot be found.
    */
    async fetchSchedules(id: string): Promise<ISchedule[]> {
        if (!id) {
            throw new BadRequestException(`Provider with ID ${id} not found`);
        }

        const provider = await this._providerRepository.findOne({ _id: new Types.ObjectId(id) });
        if (!provider) {
            throw new NotFoundException(`Provider with ID ${id} not found`);
        }

        const schedules = await Promise.all(
            provider.schedules.map(async (id: string): Promise<ISchedule | undefined> => {
                const schedule = await this._scheduleRepository.findOne({ _id: new Types.ObjectId(id) });
                return schedule ? schedule : undefined;
            })
        );
        return schedules.filter(s => s !== undefined);
    }

    /**
    * Updates a schedule for a given provider.
    * If the schedule doesn't exist, it is created.
    * 
    * @param id - The provider's unique identifier (string).
    * @param dto - The data transfer object containing schedule details (UpdateScheduleDto).
    * @returns The updated schedule and provider.
    * @throws BadRequestException if no ID is provided.
    * @throws NotFoundException if the provider does not exist.
    * @throws Error if the update fails at any point.
    */
    async updateSchedule(id: string, dto: UpdateScheduleDto): Promise<UpdateScheduleResponseDto> {
        if (!id) {
            throw new BadRequestException(`Provider with ID ${id} not found`);
        }

        const provider = await this._providerRepository.findOne({ _id: new Types.ObjectId(id) });
        if (!provider) {
            throw new NotFoundException(`Provider with ID ${id} not found`);
        }

        // Fetch existing schedule for the date
        const existingSchedule = await this._scheduleRepository.findOne({ scheduleDate: dto.scheduleDate });

        // Check for overlaps
        if (existingSchedule) {
            const newSlot = dto.slot;
            const newFrom = this._timeToMinutes(this._convertTo24HourFormat(newSlot.from));
            const newTo = this._timeToMinutes(this._convertTo24HourFormat(newSlot.to));

            // Check for duplicate slot (same from and to)
            const isDuplicate = existingSchedule.slots.some(slot =>
                slot.from === newSlot.from && slot.to === newSlot.to
            );

            if (isDuplicate) {
                throw new BadRequestException('Duplicate slot not allowed');
            }

            const hasOverlap = existingSchedule.slots.some(slot => {
                const existingFrom = this._timeToMinutes(this._convertTo24HourFormat(slot.from));
                const existingTo = this._timeToMinutes(this._convertTo24HourFormat(slot.to));
                return newFrom < existingTo && newTo > existingFrom;
            });

            if (hasOverlap) {
                throw new BadRequestException('New slot overlaps with existing slots');
            }
        }

        // update if no overlap
        const updateSchedule = await this._scheduleRepository.findOneAndUpdate(
            { scheduleDate: dto.scheduleDate },
            { $push: { slots: dto.slot } },
            { upsert: true, new: true }
        );

        if (!updateSchedule) {
            throw new Error(`Schedule Update failed`);
        }

        const updatedProvider = await this._providerRepository.findOneAndUpdate(
            { _id: new Types.ObjectId(id) },
            {
                $addToSet: { schedules: updateSchedule.id }
            },
            { new: true }
        );

        if (!updatedProvider) {
            throw new Error(`Failed to update the provider with new schedule`);
        }

        return { schedule: updateSchedule, provider: updatedProvider };
    }

    async removeSchedule(id: string, dto: RemoveScheduleDto): Promise<string> {
        if (!dto.date || !dto.id || typeof dto.id !== 'string' || !id) {
            throw new BadRequestException('Date is not found or Invalid schedule ID');
        }


        const result = await this._scheduleRepository.deleteOne(
            {
                _id: dto.id,
                scheduleDate: dto.date
            }
        );

        if (result.deletedCount === 0) {
            throw new NotFoundException('Schedule not found or already deleted');
        }

        const updatedProvider = await this._providerRepository.findOneAndUpdate(
            { _id: id },
            {
                $pull: {
                    schedules: {
                        id: dto.id,
                        date: dto.date
                    }
                }
            },
            { new: true }
        );

        if (!updatedProvider) {
            throw new NotFoundException('Failed to remove the schedule from the provider. Provider not found');
        }

        return dto.id;
    }

    private _convertTo24HourFormat(time12h: string): string {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    private _timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
}
