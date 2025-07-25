import { BaseEntity } from '../base/implementation/base.entity';
import { IScheduleDay, ISchedules, ISlot } from '../interfaces/schedules.entity.interface';

export class Slot implements ISlot {
    id: string;
    from: string;
    to: string;
    takenBy: string | null;
    isActive: boolean = true;

    constructor(partial: Partial<ISlot>) {
        Object.assign(this, partial);
    }

    equals(this: any) {
        return this
    }
}

export class ScheduleDay implements IScheduleDay {
    id: string;
    date: string;
    slots: Slot[] = [];
    isActive: boolean = true;

    constructor(partial: Partial<IScheduleDay>) {
        this.id = partial.id!;
        this.date = partial.date!;
        this.isActive = partial.isActive ?? true;

        this.slots = (partial.slots || []).map(slot => new Slot(slot));
    }

}

export class Schedules extends BaseEntity implements ISchedules {
    month: string;
    providerId: string;
    days: ScheduleDay[];
    isActive: boolean = true;
    isDeleted: boolean = false;

    constructor(partial: Partial<Schedules>) {
        super(partial);
        this.month = partial.month!;
        this.providerId = partial.providerId!;
        this.isActive = partial.isActive ?? true;
        this.isDeleted = partial.isDeleted ?? false;

        this.days = (partial.days || []).map(day => new ScheduleDay(day));
    }
}
