import { IEntity } from '../base/interfaces/base-entity.entity.interface';
import { IPagination } from './booking.entity.interface';

export interface ISlot {
    id?: string;
    from: string;
    to: string;
    takenBy: string | null;
    isActive: boolean;
}

export interface IScheduleDay {
    id?: string;
    date: string;
    slots: ISlot[];
    isActive: boolean;
}

export interface ISchedules extends IEntity {
    providerId: string;
    month: string;
    days: IScheduleDay[];
    isActive: boolean;
    isDeleted: boolean;
}

export interface IScheduleList {
    id: string;
    month: string;
    totalDays: number;
    isActive: boolean;
    createdAt: Date;
}

export interface IScheduleListWithPagination {
    scheduleList: IScheduleList[];
    pagination: IPagination;
}

