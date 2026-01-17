import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";

export interface IReservation extends IEntity {
    from: string;
    to: string;
    date: string | Date;
    providerId: string;
    customerId: string;
}