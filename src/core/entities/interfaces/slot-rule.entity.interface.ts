import { IPagination } from "@core/entities/interfaces/booking.entity.interface";
import { WeekEnum } from "@core/enum/slot-rule.enum";

export type WeekType = `${WeekEnum}`;

export interface ISlotRule {
    id: string;
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