import { Reservation } from "@core/entities/implementation/reservation.entity";
import { IReservation } from "@core/entities/interfaces/reservation.entity.interface";
import { ReservationDocument } from "@core/schema/reservation.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class ReservationMapper {
    toEntity(doc: ReservationDocument): IReservation {
        return new Reservation({
            from: doc.from,
            to: doc.to,
            ruleId: String(doc.ruleId),
            date: new Date(doc.date),
            providerId: String(doc.providerId),
            customerId: String(doc.customerId),
        });
    }

    toDocument(entity: Partial<IReservation>): Partial<ReservationDocument> {
        return {
            from: entity.from,
            to: entity.to,
            ruleId: new Types.ObjectId(entity.ruleId),
            date: new Date(entity.date as string),
            providerId: new Types.ObjectId(entity.providerId),
            customerId: new Types.ObjectId(entity.customerId),
        }
    }
}