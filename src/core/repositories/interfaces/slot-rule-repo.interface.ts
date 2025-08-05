import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { SlotRuleDocument } from "@core/schema/slot-rule.schema";

export interface ISlotRuleRepository extends IBaseRepository<SlotRuleDocument> {
    findRules(providerId: string, skip?: number, limit?: number): Promise<SlotRuleDocument[]>;
    count(): Promise<number>;
    updateRuleStatus(providerId: string, ruleId: string, status: boolean): Promise<SlotRuleDocument | null>
}