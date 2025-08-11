import { BOOKED_SLOT_MODEL_NAME, SLOT_RULE_MODEL_NAME } from "@core/constants/model.constant";
import { BOOKED_SLOT_REPOSITORY_NAME, SLOT_RULE_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { BookedSlotsRepository } from "@core/repositories/implementations/booked-slots.repository";
import { SlotRuleRepository } from "@core/repositories/implementations/slot-rule.repository";
import { BookedSlotDocument } from "@core/schema/booked-slot.schema";
import { SlotRuleDocument } from "@core/schema/slot-rule.schema";
import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

export const slotRepositoryProviders: Provider[] = [
    {
        provide: SLOT_RULE_REPOSITORY_NAME,
        useFactory: (slotRuleModel: Model<SlotRuleDocument>) =>
            new SlotRuleRepository(slotRuleModel),
        inject: [getModelToken(SLOT_RULE_MODEL_NAME)]
    },
    {
        provide: BOOKED_SLOT_REPOSITORY_NAME,
        useFactory: (bookedSlotModel: Model<BookedSlotDocument>) =>
            new BookedSlotsRepository(bookedSlotModel),
        inject: [getModelToken(BOOKED_SLOT_MODEL_NAME)]
    },
]