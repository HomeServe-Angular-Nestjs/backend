import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";

export interface IDateOverride extends IEntity {
    providerId: string;
    date: Date;
    timeRanges: {
        startTime: string;
        endTime: string
    }[];
    isAvailable: boolean;
}