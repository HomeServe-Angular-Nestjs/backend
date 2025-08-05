import { ISlotRule } from "@core/entities/interfaces/slot-rule.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { CreateRuleDto } from "@modules/slots/dtos/slot.rule.dto";

export interface ISlotRuleService {
    createRule(providerId: string, dto: CreateRuleDto): Promise<IResponse>;
    fetchRules(providerId: string): Promise<IResponse<ISlotRule[]>>
}