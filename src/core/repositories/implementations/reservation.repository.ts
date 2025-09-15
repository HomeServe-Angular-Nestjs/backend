import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ReservationDocument } from "@core/schema/reservation.schema";
import { RESERVATION_MODEL_NAME } from "@core/constants/model.constant";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { IReservationRepository } from "@core/repositories/interfaces/reservation-repo.interface";

@Injectable()
export class ReservationRepository extends BaseRepository<ReservationDocument> implements IReservationRepository {
    constructor(
        @InjectModel(RESERVATION_MODEL_NAME)
        private readonly _reservationModel: Model<ReservationDocument>
    ) {
        super(_reservationModel);
    }

    async isReserved(providerId: string, from: string, to: string, date: string | Date): Promise<boolean> {
        const isExists = await this._reservationModel.findOne({
            providerId: this._toObjectId(providerId),
            from,
            to,
            date: new Date(date)
        });

        return !!isExists;
    }

    async findAllForDate(providerId: string, date: string | Date): Promise<ReservationDocument[]> {
        return await this._reservationModel.find({
            providerId: this._toObjectId(providerId),
            date: new Date(date)
        });
    }
}