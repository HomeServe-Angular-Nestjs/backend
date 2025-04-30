import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IScheduleService } from "../interfaces/schedule-service.interface";
import { ISchedule } from "../../../../core/entities/interfaces/schedule.entity.interface";
import { PROVIDER_REPOSITORY_INTERFACE_NAME, SCHEDULE_REPOSITORY_NAME } from "../../../../core/constants/repository.constant";
import { IScheduleRepository } from "../../../../core/repositories/interfaces/schedule-repo.interface";
import { IProviderRepository } from "../../../../core/repositories/interfaces/provider-repo.interface";
import { Types } from "mongoose";
import { CreateScheduleDto } from "../../dtos/schedule.dto";

@Injectable()
export class ScheduleService implements IScheduleService {
    constructor(
        @Inject(SCHEDULE_REPOSITORY_NAME)
        private scheduleRepository: IScheduleRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private providerRepository: IProviderRepository
    ) { }

    async fetchSchedules(id: string): Promise<ISchedule[]> {
        if (!id) {
            throw new BadRequestException(`Provider with ID ${id} not found`);
        }

        const provider = await this.providerRepository.findOne({ _id: new Types.ObjectId(id) });
        if (!provider) {
            throw new NotFoundException(`Provider with ID ${id} not found`);
        }

        const schedules = await Promise.all(
            provider.schedules.map(async (id: string): Promise<ISchedule | undefined> => {
                const schedule = await this.scheduleRepository.findOne({ _id: new Types.ObjectId(id) });
                return schedule ? schedule : undefined;
            })
        );
        return schedules.filter(s => s !== undefined);
    }

    async updateSchedule(id: string, dto: CreateScheduleDto) {
        if (!id) {
            throw new BadRequestException(`Provider with ID ${id} not found`);
        }

        const provider = await this.providerRepository.findOne({ _id: new Types.ObjectId(id) });
        if (!provider) {
            throw new NotFoundException(`Provider with ID ${id} not found`);
        }

        const updateSchedule = await this.scheduleRepository.findOneAndUpdate(
            { scheduleDate: dto.scheduleDate },
            { $push: { slots: dto.slot } },
            { upsert: true, new: true }
        );

        if (!updateSchedule) {
            throw new Error(`Schedule Update failed`);
        }

        const updatedProvider = await this.providerRepository.findOneAndUpdate(
            { _id: new Types.ObjectId(id) },
            {
                $push: { schedules: new Types.ObjectId(updateSchedule.id) }
            },
            { new: true }
        );

        if (!updatedProvider) {
            throw new Error(`Failed to update the provider with new schedule`);
        }

        return { updateSchedule, updatedProvider };
    }
}