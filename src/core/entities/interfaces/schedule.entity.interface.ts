import { IEntity } from "../base/interfaces/base-entity.entity.interface";

export interface ISlot {
    from: string;
    to: string;
    takenBy: string;
}

export type SlotType = Omit<ISlot, 'takenBy'>;

export interface ISchedule extends IEntity{
    scheduleDate: Date,
    slots: ISlot[];
    // status: boolean;
    // bookingLimit?: number;
    // bufferTime?: string;
    // serviceArea?: [number, number];
    // serviceRadius: number;
}