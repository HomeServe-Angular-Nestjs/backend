import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { IDateOverride } from "@core/entities/interfaces/date-override.entity.interface";

export class DateOverride extends BaseEntity implements IDateOverride {
    providerId: string;
    date: Date;
    timeRanges: {
        startTime: string;
        endTime: string
    }[];
    isAvailable: boolean;

    constructor(partials: Partial<DateOverride>) {
        super(partials);
        Object.assign(this, partials);
    }
}