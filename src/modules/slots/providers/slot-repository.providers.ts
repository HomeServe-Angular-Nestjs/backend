import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BOOKINGS_MODEL_NAME, RESERVATION_MODEL_NAME, SLOT_RULE_MODEL_NAME } from "@core/constants/model.constant";
import { BOOKING_REPOSITORY_NAME, RESERVATION_REPOSITORY_NAME, SLOT_RULE_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { BookingRepository } from "@core/repositories/implementations/bookings.repository";
import { ReservationRepository } from "@core/repositories/implementations/reservation.repository";
import { SlotRuleRepository } from "@core/repositories/implementations/slot-rule.repository";
import { BookingDocument } from "@core/schema/bookings.schema";
import { ReservationDocument } from "@core/schema/reservation.schema";
import { SlotRuleDocument } from "@core/schema/slot-rule.schema";

export const slotRepositoryProviders: Provider[] = [
    {
        provide: SLOT_RULE_REPOSITORY_NAME,
        useFactory: (slotRuleModel: Model<SlotRuleDocument>) =>
            new SlotRuleRepository(slotRuleModel),
        inject: [getModelToken(SLOT_RULE_MODEL_NAME)]
    },
    {
        provide: BOOKING_REPOSITORY_NAME,
        useFactory: (bookingModel: Model<BookingDocument>) =>
            new BookingRepository(bookingModel),
        inject: [(getModelToken(BOOKINGS_MODEL_NAME))]
    },
    {
        provide: RESERVATION_REPOSITORY_NAME,
        useFactory: (reservationModel: Model<ReservationDocument>) =>
            new ReservationRepository(reservationModel),
        inject: [(getModelToken(RESERVATION_MODEL_NAME))]
    },

]