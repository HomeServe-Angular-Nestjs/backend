import { SLOT_RULE_MODEL_NAME } from "@core/constants/model.constant";
import { ISlotRule } from "@core/entities/interfaces/slot-rule.entity.interface";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { ISlotRuleRepository } from "@core/repositories/interfaces/slot-rule-repo.interface";
import { SlotRuleDocument } from "@core/schema/slot-rule.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

@Injectable()
export class SlotRuleRepository extends BaseRepository<SlotRuleDocument> implements ISlotRuleRepository {
    constructor(
        @InjectModel(SLOT_RULE_MODEL_NAME)
        private readonly _slotRuleModel: Model<SlotRuleDocument>
    ) {
        super(_slotRuleModel)
    }

    findRules(providerId: string): Promise<SlotRuleDocument[]> {
        return this._slotRuleModel.find({ providerId: new Types.ObjectId(providerId) }).lean();
    }

}