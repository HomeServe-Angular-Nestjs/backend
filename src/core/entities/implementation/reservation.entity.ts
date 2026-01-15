import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { IReservation } from "@core/entities/interfaces/reservation.entity.interface";

export class Reservation extends BaseEntity implements IReservation {
    from: string;
    to: string;
    date: string | Date;
    providerId: string;
    customerId: string;

    constructor(partial: Partial<Reservation>) {
        super(partial);
        Object.assign(this, partial);
    }
}