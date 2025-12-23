import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { IDayAvailability, IWeeklyAvailability } from "@core/entities/interfaces/weekly-availability.entity.interface";

export class WeeklyAvailability extends BaseEntity implements IWeeklyAvailability {
    providerId: string;
    week: {
        sun: IDayAvailability;
        mon: IDayAvailability;
        tue: IDayAvailability;
        wed: IDayAvailability;
        thu: IDayAvailability;
        fri: IDayAvailability;
        sat: IDayAvailability;
    };

    constructor(partials: Partial<WeeklyAvailability>) {
        super(partials);
        Object.assign(this, partials);
    }
}
