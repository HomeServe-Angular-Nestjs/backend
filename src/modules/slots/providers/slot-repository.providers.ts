import { SLOT_RULE_MODEL_NAME } from "@core/constants/model.constant";
import { SLOT_RULE_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { SlotRuleRepository } from "@core/repositories/implementations/slot-rule.repository";
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
    }
]