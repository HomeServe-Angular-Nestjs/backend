import { IReservation } from "@core/entities/interfaces/reservation.entity.interface";
import { ReservationDocument } from "@core/schema/reservation.schema";

export interface IReservationMapper {
    toEntity(doc: ReservationDocument): IReservation;
    toDocument(entity: Partial<IReservation>): Partial<ReservationDocument>;
}