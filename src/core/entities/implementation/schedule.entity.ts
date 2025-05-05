import { BaseEntity } from "../base/implementation/base.entity";
import { ISchedule, ISlot } from "../interfaces/schedule.entity.interface";


export class Slot extends BaseEntity implements ISlot {
    from: string;
    to: string;
    takenBy?: string;

    constructor(partial: Partial<Slot>) {
        super(partial);
        Object.assign(this, partial);
    }
}


export class Schedule extends BaseEntity implements ISchedule {
    scheduleDate: Date;
    slots: ISlot[];

    constructor(partial: Partial<Schedule>) {
        super(partial);
        Object.assign(this, partial);
        if (partial.slots) {
            this.slots = partial.slots.map(s => new Slot(s));
        }
    }
}