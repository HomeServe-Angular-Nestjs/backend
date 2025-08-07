import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";
import { IPagination } from "@core/entities/interfaces/booking.entity.interface";
import { RuleSortEnum, WeekEnum } from "@core/enum/slot-rule.enum";

export type WeekType = `${WeekEnum}`;

export interface ISlotRule extends IEntity {
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
}

export interface ISlotRulePaginatedResponse {
    rules: ISlotRule[];
    pagination: IPagination;
}

export interface IRuleFilter {
    search?: string;
    startDate?: string;
    endDate?: string;
    ruleStatus?: String;
    sort?: RuleSortEnum;
}


export interface IAvailableSlot {
    from: string;
    to: string;
}

export interface ISlotResponse extends IAvailableSlot {
    ruleId: string;
}

export interface ISlotGroup {
    ruleId: string;
    priority: number;
    slots: IAvailableSlot[]
} 