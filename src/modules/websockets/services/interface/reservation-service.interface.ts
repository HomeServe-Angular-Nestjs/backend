import type { IReservation } from '@core/entities/interfaces/reservation.entity.interface';
import type { ReservationDocument } from '@core/schema/reservation.schema';

export interface IReservationService {
  createReservation(data: Partial<IReservation>): Promise<ReservationDocument>;
  isReserved(providerId: string, from: string, to: string, date: string): Promise<boolean>;
  releaseReservation(providerId: string, from: string, to: string, date: string): Promise<{ deletedCount?: number }>;
}
