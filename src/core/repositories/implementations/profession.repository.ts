import { IProfessionRepository } from "@core/repositories/interfaces/profession-repo.interface";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../base/implementations/base.repository";
import { ProfessionDocument } from "@core/schema/profession.schema";
import { InjectModel } from "@nestjs/mongoose";
import { PROFESSION_MODEL_NAME } from "@core/constants/model.constant";
import { FilterQuery, Model } from "mongoose";
import { IProfessionFilter } from "@core/entities/interfaces/profession.entity.interface";

@Injectable()
export class ProfessionRepository extends BaseRepository<ProfessionDocument> implements IProfessionRepository {
    constructor(
        @InjectModel(PROFESSION_MODEL_NAME)
        private readonly _professionModel: Model<ProfessionDocument>
    ) {
        super(_professionModel);
    }

    update(professionId: string, update: Partial<ProfessionDocument>): Promise<ProfessionDocument | null> {
        return this._professionModel.findOneAndUpdate(
            { _id: professionId },
            { $set: update },
            { new: true }
        );
    }

    async findAllWithFilter(filter: IProfessionFilter): Promise<ProfessionDocument[]> {
        const query: FilterQuery<ProfessionDocument> = { isDeleted: false };

        if (filter.search) {
            query.name = { $regex: filter.search, $options: 'i' };
        }
        if (filter.isActive !== 'all') {
            query.isActive = filter.isActive === 'true';
        }

        return await this._professionModel.find(query);
    }

    async toggleStatus(professionId: string): Promise<boolean> {
        const result = await this._professionModel.findByIdAndUpdate(
            { _id: professionId },
            [{ $set: { isActive: { $not: "$isActive" } } }],
            { new: true }
        );

        return !!result;
    }

    async removeProfession(professionId: string): Promise<boolean> {
        const result = await this._professionModel.deleteOne({ _id: professionId });
        return result.deletedCount === 1;
    }

    async count(filter: FilterQuery<ProfessionDocument> = {}): Promise<number> {
        filter.isDeleted = false;
        return await this._professionModel.countDocuments(filter);
    }
}