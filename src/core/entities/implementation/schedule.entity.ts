import { BaseEntity } from "../base/implementation/base.entity";
import { ISchedule, ISlot } from "../interfaces/schedule.entity.interface";

export class Schedule extends BaseEntity implements ISchedule {
    // bookingLimit?: number | undefined;
    // bufferTime?: string | undefined;
    scheduleDate: Date;
    // serviceArea?: [number, number] | undefined;
    // serviceRadius: number;
    slots: ISlot[];
    // status: boolean;

    constructor(partial: Partial<Schedule>) {
        super(partial);
        Object.assign(this, partial)
    }
}