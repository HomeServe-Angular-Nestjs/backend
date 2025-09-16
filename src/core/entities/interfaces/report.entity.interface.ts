import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";

export type ReportedType = 'customer' | 'provider';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved';

export interface IReport extends IEntity {
    reportedId: string;
    targetId: string;
    type: ReportedType;
    reason: string;
    description: string;
    status: ReportStatus;
}