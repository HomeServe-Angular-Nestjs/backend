import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { ReservationDocument } from "@core/schema/reservation.schema";

export interface IReservationRepository extends IBaseRepository<ReservationDocument> {
    isReserved(providerId: string, from: string, to: string, date: string | Date): Promise<boolean>;
    findAllForDate(providerId: string, date: string | Date): Promise<ReservationDocument[]>;
}