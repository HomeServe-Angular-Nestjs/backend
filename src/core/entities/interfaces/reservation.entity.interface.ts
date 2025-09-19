import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";
import { Types } from "mongoose";

export interface IReservation extends IEntity {
    from: string;
    to: string;
    ruleId: string;
    date: Date | string;
    providerId: string;
    customerId: string;
}