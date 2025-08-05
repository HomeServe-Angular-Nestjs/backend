import { ISlotRule } from "@core/entities/interfaces/slot-rule.entity.interface";

export interface ISlotRuleMapper {
    toEntity(doc: any): ISlotRule;
}