import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { ISlotRule, WeekType } from "@core/entities/interfaces/slot-rule.entity.interface";

export class SlotRule extends BaseEntity implements ISlotRule {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    daysOfWeek: WeekType[];
    startTime: string;
    endTime: string;
    slotDuration: number;
    breakDuration: number;
    capacity: number;
    isActive: boolean;
    priority: number;
    excludeDates: Date[];

    constructor(partial: Partial<SlotRule>) {
        super(partial);
        Object.assign(this, partial);
    }
}