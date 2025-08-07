import { ISlotRule, ISlotRulePaginatedResponse } from "@core/entities/interfaces/slot-rule.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { CreateRuleDto, EditRuleDto, RuleFilterDto } from "@modules/slots/dtos/slot.rule.dto";

export interface ISlotRuleService {
    createRule(providerId: string, dto: CreateRuleDto): Promise<IResponse<ISlotRule>>;
    editRule(providerId: string, ruleId: string, dto: EditRuleDto): Promise<IResponse<ISlotRule>>;
    fetchRules(providerId: string, filters: RuleFilterDto): Promise<IResponse<ISlotRulePaginatedResponse>>;
    removeRule(providerId: string, ruleId: string): Promise<IResponse>;
    updateStatus(providerId: string, ruleId: string, status: boolean): Promise<IResponse<ISlotRule>>
    getAvailableSlots(providerId: string, date: string): Promise<IResponse>;
}