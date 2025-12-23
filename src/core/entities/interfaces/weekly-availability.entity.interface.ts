import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";

export interface IWeeklyAvailability extends IEntity {
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
}

export interface IDayAvailability {
    isAvailable: boolean;
    timeRanges: {
        startTime: string;
        endTime: string;
    }[];
}