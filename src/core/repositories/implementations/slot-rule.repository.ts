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

    private _toObjectId(id: string): Types.ObjectId {
        return new Types.ObjectId(id);
    }

    async findRules(providerId: string, skip?: number, limit?: number): Promise<SlotRuleDocument[]> {
        const result = this._slotRuleModel.find({ providerId: this._toObjectId(providerId) });
        if (typeof limit === 'number') result.limit(limit);
        if (typeof skip === 'number') result.skip(skip);
        result.sort({ createdAt: -1 });
        return await result.exec();
    }

    async count(): Promise<number> {
        return await this._slotRuleModel.countDocuments();
    }

    async updateRuleStatus(providerId: string, ruleId: string, status: boolean): Promise<SlotRuleDocument | null> {
        return await this._slotRuleModel.findOneAndUpdate(
            {
                _id: ruleId,
                providerId: this._toObjectId(providerId),
            },
            { $set: { isActive: status } },
            { new: true }
        );
    }
}