import { RESERVATION_MAPPER } from "@core/constants/mappers.constant";
import { RESERVATION_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { IReservationMapper } from "@core/dto-mapper/interface/reservation.mapper.interface";
import { IReservation } from "@core/entities/interfaces/reservation.entity.interface";
import { IReservationRepository } from "@core/repositories/interfaces/reservation-repo.interface";
import { ReservationDocument } from "@core/schema/reservation.schema";
import { IReservationService } from "@modules/websockets/services/interface/reservation-service.interface";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class ReservationService implements IReservationService {

    constructor(
        @Inject(RESERVATION_REPOSITORY_NAME)
        private readonly _reservationRepository: IReservationRepository,
        @Inject(RESERVATION_MAPPER)
        private readonly _reservationMapper: IReservationMapper
    ) { }

    async createReservation(data: IReservation): Promise<ReservationDocument> {
        return await this._reservationRepository.create(this._reservationMapper.toDocument({
            from: data.from,
            to: data.to,
            date: data.date,
            ruleId: data.ruleId,
            providerId: data.providerId,
            customerId: data.customerId,
        }));
    }

    async isReserved(providerId: string, from: string, to: string, date: string): Promise<boolean> {
        return await this._reservationRepository.isReserved(providerId, from, to, date);
    }

}