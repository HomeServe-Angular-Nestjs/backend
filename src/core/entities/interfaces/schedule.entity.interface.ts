import { IEntity } from "../base/interfaces/base-entity.entity.interface";


export type SlotType = {
    from: string;
    to: string;
};

export interface ISlot {
    id: string;
    from: string;
    to: string;
    takenBy: string | null;
}

export interface ISchedule extends IEntity {
    scheduleDate: string,
    slots: ISlot[];
}