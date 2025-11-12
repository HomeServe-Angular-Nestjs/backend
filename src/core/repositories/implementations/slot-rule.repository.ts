import { SLOT_RULE_MODEL_NAME } from "@core/constants/model.constant";
import { IRuleFilter, ISlotRule } from "@core/entities/interfaces/slot-rule.entity.interface";
import { RuleSortEnum } from "@core/enum/slot.enum";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { ISlotRuleRepository } from "@core/repositories/interfaces/slot-rule-repo.interface";
import { SlotRuleDocument } from "@core/schema/slot-rule.schema";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types, } from "mongoose";

export type SortDirection = 1 | -1;
export type SortQuery<T> = {
    [P in keyof T]?: SortDirection;
};

@Injectable()
export class SlotRuleRepository extends BaseRepository<SlotRuleDocument> implements ISlotRuleRepository {
    constructor(
        @InjectModel(SLOT_RULE_MODEL_NAME)
        private readonly _slotRuleModel: Model<SlotRuleDocument>
    ) {
        super(_slotRuleModel)
    }

    private __buildFilterQuery(providerId: string, filter: IRuleFilter): FilterQuery<SlotRuleDocument> {
        const query: FilterQuery<SlotRuleDocument> = { providerId: this._toObjectId(providerId) };
        if (filter.search) {
            query.name = { $regex: filter.search, $options: 'i' }
        }

        if (filter.startDate && filter.endDate) {
            query.startDate = { $lte: new Date(filter.endDate) };
            query.endDate = { $gte: new Date(filter.startDate) };
        } else if (filter.startDate) {
            query.endDate = { $gte: new Date(filter.startDate) };
        } else if (filter.endDate) {
            query.startDate = { $lte: new Date(filter.endDate) };
        }

        if (filter.ruleStatus && filter.ruleStatus !== 'all') {
            query.isActive = filter.ruleStatus === 'true';
        }
        return query;
    }

    private _buildSortQuery(filter: IRuleFilter): SortQuery<ISlotRule> {
        const sort: SortQuery<ISlotRule> = {};

        switch (filter.sort) {
            case RuleSortEnum.LATEST:
                sort.createdAt = -1;
                break;
            case RuleSortEnum.OLDEST:
                sort.createdAt = 1;
                break;
            case RuleSortEnum.HIGH_PRIORITY:
                sort.priority = -1;
                break;
            case RuleSortEnum.LOW_PRIORITY:
                sort.priority = 1;
                break;
            default:
                sort.createdAt = -1;
        }

        return sort;
    }

    async count(): Promise<number> {
        return await this._slotRuleModel.countDocuments();
    }

    async findActiveRulesByProviderId(providerId: string): Promise<SlotRuleDocument[]> {
        return await this._slotRuleModel
            .find({
                providerId: this._toObjectId(providerId),
                isActive: true,
                endDate: { $gte: new Date() }
            })
            .sort({ priority: 1 })
            .lean();
    }

    async findRulesWithFilter(providerId: string, filter: IRuleFilter = {}, skip: number = 0, limit: number = 10): Promise<SlotRuleDocument[]> {
        const query = this.__buildFilterQuery(providerId, filter);
        const sort = this._buildSortQuery(filter);
        return await this._slotRuleModel
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean()
            .exec()
    }

    async findRuleAndUpdate(providerId: string, ruleId: string, updateData: Partial<ISlotRule>): Promise<SlotRuleDocument | null> {
        return await this._slotRuleModel.findOneAndUpdate(
            {
                _id: ruleId,
                providerId: this._toObjectId(providerId)
            },
            { $set: updateData },
            { new: true }
        ).lean().exec();
    }

    async updateRuleStatus(providerId: string, ruleId: string, status: boolean): Promise<SlotRuleDocument | null> {
        return await this._slotRuleModel.findOneAndUpdate(
            {
                _id: ruleId,
                providerId: this._toObjectId(providerId),
            },
            { $set: { isActive: status } },
            { new: true }
        ).lean().exec();
    }
}