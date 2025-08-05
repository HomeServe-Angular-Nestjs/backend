import { SLOT_RULE_MAPPER } from "@core/constants/mappers.constant";
import { SLOT_RULE_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ISlotRuleMapper } from "@core/dto-mapper/interface/slot-rule.mapper.interface";
import { ISlotRule } from "@core/entities/interfaces/slot-rule.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { ISlotRuleRepository } from "@core/repositories/interfaces/slot-rule-repo.interface";
import { CreateRuleDto } from "@modules/slots/dtos/slot.rule.dto";
import { ISlotRuleService } from "@modules/slots/services/interfaces/slot-rule-service.interface";
import { Inject, Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class SlotRuleService implements ISlotRuleService {

    constructor(
        @Inject(SLOT_RULE_REPOSITORY_NAME)
        private readonly _slotRuleRepository: ISlotRuleRepository,
        @Inject(SLOT_RULE_MAPPER)
        private readonly _slotRuleMapper: ISlotRuleMapper,
    ) { }

    async createRule(providerId: string, dto: CreateRuleDto): Promise<IResponse> {

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

    async fetchRules(providerId: string): Promise<IResponse<ISlotRule[]>> {
        const ruleDocuments = await this._slotRuleRepository.findRules(providerId);
        console.log(ruleDocuments);
        const rules = (ruleDocuments ?? []).map(rule => this._slotRuleMapper.toEntity(rule));

        return {
            success: true,
            message: 'Slot rules fetched successfully.',
            data: rules
        }
    }
}