import { IReservation } from "@core/entities/interfaces/reservation.entity.interface";
import { ReservationDocument } from "@core/schema/reservation.schema";

export interface IReservationService {
    createReservation(data: Partial<IReservation>): Promise<ReservationDocument>;
    isReserved(providerId: string, from: string, to: string, date: string): Promise<boolean>;
}   