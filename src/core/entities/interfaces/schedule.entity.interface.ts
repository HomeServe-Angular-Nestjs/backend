import { IEntity } from "../base/interfaces/base-entity.entity.interface";


export type SlotType = {
    from: string;
    to: string;
};

export interface ISlot extends IEntity {
    from: string;
    to: string;
    takenBy?: string;
}

export interface ISchedule extends IEntity {
    scheduleDate: Date,
    slots: ISlot[];
}