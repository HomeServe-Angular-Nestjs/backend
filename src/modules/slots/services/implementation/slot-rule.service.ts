import { BOOKING_MAPPER, SLOT_RULE_MAPPER } from "@core/constants/mappers.constant";
import { BOOKING_REPOSITORY_NAME, SLOT_RULE_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { IBookingMapper } from "@core/dto-mapper/interface/bookings.mapper.interface";
import { ISlotRuleMapper } from "@core/dto-mapper/interface/slot-rule.mapper.interface";
import { IBookedSlot } from "@core/entities/interfaces/booking.entity.interface";
import { IAvailableSlot, IRuleFilter, ISlotGroup, ISlotResponse, ISlotRule, ISlotRulePaginatedResponse, WeekType } from "@core/entities/interfaces/slot-rule.entity.interface";
import { ErrorMessage } from "@core/enum/error.enum";
import { RuleSortEnum, SlotStatusEnum, WeekEnum } from "@core/enum/slot.enum";
import { ICustomLogger } from "@core/logger/interface/custom-logger.interface";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { IResponse } from "@core/misc/response.util";
import { IBookingRepository } from "@core/repositories/interfaces/bookings-repo.interface";
import { ISlotRuleRepository } from "@core/repositories/interfaces/slot-rule-repo.interface";
import { CreateRuleDto, EditRuleDto, RuleFilterDto } from "@modules/slots/dtos/slot.rule.dto";
import { ISlotRuleService } from "@modules/slots/services/interfaces/slot-rule-service.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class SlotRuleService implements ISlotRuleService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(SLOT_RULE_REPOSITORY_NAME)
        private readonly _slotRuleRepository: ISlotRuleRepository,
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(SLOT_RULE_MAPPER)
        private readonly _slotRuleMapper: ISlotRuleMapper,
        @Inject(BOOKING_MAPPER)
        private readonly _bookingMapper: IBookingMapper
    ) {
        this.logger = this._loggerFactory.createLogger(SlotRuleService.name);
    }

    private _isValidSelectedDate(normalizedDate: Date, selectedDay: WeekType, rule: ISlotRule): boolean {
        const ruleStart = new Date(rule.startDate);
        const ruleEnd = new Date(rule.endDate);

        // Checking if selected date is within the rule's active date range
        if (normalizedDate < new Date(ruleStart.toDateString()) || normalizedDate > new Date(ruleEnd.toDateString())) {
            return false;
        }

        // Checking if selectedDay is in rule.daysOfWeek
        if (!rule.daysOfWeek.includes(selectedDay)) {
            return false;
        }

        // Check if selected date is in excludeDates
        const isExcluded = rule.excludeDates.some((excluded: Date) =>
            new Date(excluded).toDateString() === normalizedDate.toDateString()
        );

        if (isExcluded) {
            return false;
        }

        return true;
    }

    private _generateSlots(rule: ISlotRule) {
        const addMinutes = (date: Date, duration: number) =>
            new Date(date.getTime() + duration * 60000);

        const formatTime = (date: Date) =>
            date.toTimeString().slice(0, 5);

        const startTime = this._parseTime(rule.startTime);
        const endTime = this._parseTime(rule.endTime);

        const slots: IAvailableSlot[] = [];

        let currentStart = new Date(startTime);

        while (true) {
            const currentEnd = addMinutes(currentStart, rule.slotDuration);
            if (currentEnd > endTime) break;
            slots.push({
                from: formatTime(currentStart),
                to: formatTime(currentEnd)
            });

            currentStart = addMinutes(currentEnd, rule.breakDuration);
        }

        return slots;
    }

    private _getFinalAvailableSlots(slotGroups: ISlotGroup[]): ISlotResponse[] {
        if (!slotGroups.length) return [];

        const finalSlots: ISlotResponse[] = [];

        const sortedGroups = [...slotGroups].sort((a, b) => b.priority - a.priority);

        for (const group of sortedGroups) {
            for (const slot of group.slots) {
                const fromTime = this._parseTime(slot.from);
                const toTime = this._parseTime(slot.to);

                const isOverlapping = finalSlots.some(existing => {
                    const existingFrom = this._parseTime(existing.from);
                    const existingTo = this._parseTime(existing.to);
                    return fromTime < existingTo && existingFrom < toTime;
                });

                if (!isOverlapping) {
                    finalSlots.push({
                        ...slot,
                        ruleId: group.ruleId
                    });
                }
            }
        }

        return finalSlots;
    }

    private _parseTime(timeStr: string): Date {
        const [hours, minutes] = timeStr.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0);
        return date;
    };


    private _isAlreadyBooked(slot: ISlotResponse, bookedSlots: IBookedSlot[]) {
        return bookedSlots.some(booked =>
            booked.from === slot.from &&
            booked.to === slot.to &&
            booked.status !== SlotStatusEnum.AVAILABLE
        );
    }

    async createRule(providerId: string, dto: CreateRuleDto): Promise<IResponse<ISlotRule>> {

        const newSlotRule = await this._slotRuleRepository.create({
            providerId: new Types.ObjectId(providerId),
            name: dto.name,
            description: dto.description,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            daysOfWeek: dto.daysOfWeek,
            startTime: dto.startTime,
            endTime: dto.endTime,
            slotDuration: dto.slotDuration,
            breakDuration: dto.breakDuration,
            capacity: dto.capacity,
            isActive: dto.isActive,
            priority: dto.priority,
            excludeDates: (dto.excludeDates).map(dateStr => new Date(dateStr))
        });

        if (!newSlotRule) return {
            success: false,
            message: 'Failed to create new slot rule.'
        }

        return {
            success: true,
            message: 'Your slot rule was successfully created.',
            data: this._slotRuleMapper.toEntity(newSlotRule)
        }
    }

    async fetchRules(providerId: string, filter: RuleFilterDto): Promise<IResponse<ISlotRulePaginatedResponse>> {
        const page = filter?.page || 0;
        const limit = 8;
        const skip = (page - 1) * limit;
        const total = await this._slotRuleRepository.count();

        const ruleDocuments = await this._slotRuleRepository.findRules(
            providerId,
            filter as IRuleFilter,
            skip,
            limit
        );
        const rules = (ruleDocuments ?? []).map(rule => this._slotRuleMapper.toEntity(rule));

        return {
            success: true,
            message: 'Slot rules fetched successfully.',
            data: {
                rules,
                pagination: {
                    limit,
                    page,
                    total,
                }
            }
        }
    }

    async editRule(providerId: string, ruleId: string, updateData: EditRuleDto): Promise<IResponse<ISlotRule>> {
        const updatedRule = await this._slotRuleRepository.findRuleAndUpdate(
            providerId,
            ruleId.toString(),
            updateData as Partial<ISlotRule>
        );

        if (!updatedRule) {
            this.logger.error(`Rule document of id ${ruleId} was not found.`);
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        return {
            success: true,
            message: 'Rule successfully updated.',
            data: this._slotRuleMapper.toEntity(updatedRule)
        }
    }

    async updateStatus(providerId: string, ruleId: string, status: boolean): Promise<IResponse<ISlotRule>> {
        const updatedRule = await this._slotRuleRepository.updateRuleStatus(providerId, ruleId, !status);

        if (!updatedRule) {
            this.logger.error(`Rule document of id ${ruleId} was not found.`);
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        return {
            success: true,
            message: 'Rule updated successfully.',
            data: this._slotRuleMapper.toEntity(updatedRule)
        }
    }

    async removeRule(providerId: string, ruleId: string): Promise<IResponse> {
        const result = await this._slotRuleRepository.deleteOne({
            _id: ruleId,
            providerId: new Types.ObjectId(providerId)
        });

        if (result.deletedCount == 0) {
            this.logger.error(`Rule document of id ${ruleId} was not found.`);
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        return {
            success: true,
            message: 'Successfully removed.'
        }
    }

    async getAvailableSlots(providerId: string, date: string): Promise<IResponse> {
        const ruleDocument = await this._slotRuleRepository.findRules(
            providerId,
            {
                startDate: date,
                sort: RuleSortEnum.HIGH_PRIORITY,
                ruleStatus: 'true'
            }
        );

        const rules = ruleDocument.map(rule => this._slotRuleMapper.toEntity(rule));

        const days = Object.values(WeekEnum);
        const selectedDate = new Date(date);
        const selectedDay = days[selectedDate.getDay()];
        const normalizedDate = new Date(selectedDate.toDateString());

        const slots: ISlotGroup[] = rules.map(rule => {
            const isValid = this._isValidSelectedDate(normalizedDate, selectedDay, rule);
            if (!isValid) return null;

            return {
                ruleId: rule.id,
                priority: rule.priority,
                breakDuration: rule.breakDuration,
                slots: this._generateSlots(rule)
            }
        }).filter((slot): slot is ISlotGroup => slot !== null);

        const bookedSlotDocument = await this._bookingRepository.findSlotsByDate(selectedDate);
        const bookedSlots = bookedSlotDocument.map(slot => this._bookingMapper.toSlotEntity(slot));
        
        const finalSortedSlots = this._getFinalAvailableSlots(slots)
            .filter(slot => !this._isAlreadyBooked(slot, bookedSlots))
            .sort((a, b) =>
                Number(a.from.split(':')[0]) - Number(b.from.split(':')[0])
            );

        return {
            success: true,
            message: 'Fetched available slots',
            data: finalSortedSlots
        }
    }
}