import { SLOT_RULE_MAPPER } from "@core/constants/mappers.constant";
import { SLOT_RULE_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ISlotRuleMapper } from "@core/dto-mapper/interface/slot-rule.mapper.interface";
import { IRuleFilter, ISlotRule, ISlotRulePaginatedResponse } from "@core/entities/interfaces/slot-rule.entity.interface";
import { ErrorMessage } from "@core/enum/error.enum";
import { ICustomLogger } from "@core/logger/interface/custom-logger.interface";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { IResponse } from "@core/misc/response.util";
import { ISlotRuleRepository } from "@core/repositories/interfaces/slot-rule-repo.interface";
import { CreateRuleDto, EditRuleDto, RuleFilterDto, RuleIdDto } from "@modules/slots/dtos/slot.rule.dto";
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
        @Inject(SLOT_RULE_MAPPER)
        private readonly _slotRuleMapper: ISlotRuleMapper,
    ) { }

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
}