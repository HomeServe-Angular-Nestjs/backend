import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DateTime } from 'luxon';
import { ITimeUtility, ITimeConfig } from "@core/utilities/interface/time.utility.interface";
import { ErrorCodes } from "@core/enum/error.enum";

@Injectable()
export class TimeUtility implements ITimeUtility {
    private readonly _tz: string;

    constructor(cfg: ITimeConfig) {
        this._tz = cfg.timeZone;
    }

    // Combines a local date  + time into a UTC Date object.
    combineLocalDateAndTimeUTC(dateStr: string, timeStr: string): Date {
        const dt = DateTime.fromISO(`${dateStr}T${timeStr}`, { zone: this._tz });
        if (!dt.isValid) {
            throw new InternalServerErrorException({
                code: ErrorCodes.VALIDATION_FAILED,
                message: `Invalid date/time: ${dt.invalidExplanation}`
            });
        }

        return dt.toUTC().toJSDate();
    }

    // Returns current UTC Date
    nowUTC(): Date {
        return DateTime.utc().toJSDate();
    }

    // Checks if the current time is within given hours from a reference UTC date.
    isWithinHoursFrom(referenceUTCDate: Date, hours: number): boolean {
        const now = DateTime.utc();
        const ref = DateTime.fromJSDate(referenceUTCDate, { zone: 'utc' });
        const diff = now.diff(ref, 'hours').hours;
        return diff <= hours;
    }

}