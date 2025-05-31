import { BaseEntity } from "../base/implementation/base.entity";
import { ISchedule, ISlot } from "../interfaces/schedule.entity.interface";


export class Slot implements ISlot {
    id: string;
    from: string;
    to: string;
    takenBy: string | null;

    constructor(partial: Partial<Slot>) {
        Object.assign(this, partial);
    }
}


export class Schedule extends BaseEntity implements ISchedule {
    scheduleDate: string;
    slots: ISlot[];

    constructor(partial: Partial<Schedule>) {
        super(partial);
        Object.assign(this, partial);
        if (partial.slots) {
            this.slots = partial.slots.map(s => new Slot(s));
        }
    }
}