import { ISlotRuleMapper } from "@core/dto-mapper/interface/slot-rule.mapper.interface";
import { SlotRule } from "@core/entities/implementation/slot-rule.entity";
import { ISlotRule } from "@core/entities/interfaces/slot-rule.entity.interface";
import { SlotRuleDocument } from "@core/schema/slot-rule.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class SlotRuleMapper implements ISlotRuleMapper {
    toEntity(doc: SlotRuleDocument): ISlotRule {
        return new SlotRule({
            id: (doc._id as Types.ObjectId).toString(),
            name: doc.name,
            description: doc.description,
            startDate: new Date(doc.startDate),
            endDate: new Date(doc.endDate),
            daysOfWeek: doc.daysOfWeek,
            startTime: doc.startTime,
            endTime: doc.endTime,
            slotDuration: doc.slotDuration,
            breakDuration: doc.breakDuration,
            capacity: doc.capacity,
            isActive: doc.isActive,
            priority: doc.priority,
            excludeDates: doc.excludeDates,
        });
    }
}