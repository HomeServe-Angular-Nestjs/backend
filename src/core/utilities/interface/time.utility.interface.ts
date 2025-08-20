export interface ITimeConfig {
    timeZone: string;
}

export interface ITimeUtility {
    combineLocalDateAndTimeUTC(dateStr: string, timeStr: string): Date;
    nowUTC(): Date;
    isWithinHoursFrom(referenceUTCDate: Date, hours: number): boolean;
}