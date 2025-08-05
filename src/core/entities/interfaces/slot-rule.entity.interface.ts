import { WeekEnum } from "@core/enum/slot-rule.enum";

export type WeekType = `${WeekEnum}`;

export interface ISlotRule {
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