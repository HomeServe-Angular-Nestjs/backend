import { Reservation } from "@core/entities/implementation/reservation.entity";
import { IReservation } from "@core/entities/interfaces/reservation.entity.interface";
import { ReservationDocument } from "@core/schema/reservation.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class ReservationMapper {
    toEntity(doc: ReservationDocument): IReservation {
        const formattedDate = new Date(doc.date);
        formattedDate.setHours(0, 0, 0, 0);

        return new Reservation({
            from: doc.from,
            to: doc.to,
            date: formattedDate,
            providerId: String(doc.providerId),
            customerId: String(doc.customerId),
        });
    }

    toDocument(entity: Partial<IReservation>): Partial<ReservationDocument> {
        const formattedDate = new Date(entity.date as string);
        formattedDate.setHours(0, 0, 0, 0);

        return {
            from: entity.from,
            to: entity.to,
            date: formattedDate,
            providerId: new Types.ObjectId(entity.providerId),
            customerId: new Types.ObjectId(entity.customerId),
        }
    }
}