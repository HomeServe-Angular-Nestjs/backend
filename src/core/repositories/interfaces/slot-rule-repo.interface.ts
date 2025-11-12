import { IRuleFilter, ISlotRule } from "@core/entities/interfaces/slot-rule.entity.interface";
import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { SlotRuleDocument } from "@core/schema/slot-rule.schema";

export interface ISlotRuleRepository extends IBaseRepository<SlotRuleDocument> {
    findActiveRulesByProviderId(providerId: string): Promise<SlotRuleDocument[]>
    findRulesWithFilter(providerId: string, filters?: IRuleFilter, skip?: number, limit?: number): Promise<SlotRuleDocument[]>;
    findRuleAndUpdate(providerId: string, ruleId: string, updateData: Partial<ISlotRule>): Promise<SlotRuleDocument | null>;
    count(): Promise<number>;
    updateRuleStatus(providerId: string, ruleId: string, status: boolean): Promise<SlotRuleDocument | null>;
}