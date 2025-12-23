import { IServiceCategoryRepository } from "@core/repositories/interfaces/service-category-repo.interface";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../base/implementations/base.repository";
import { ServiceCategoryDocument } from "@core/schema/service-category";
import { InjectModel } from "@nestjs/mongoose";
import { SERVICE_CATEGORY_MODEL_NAME } from "@core/constants/model.constant";
import { FilterQuery, Model } from "mongoose";
import { IServiceCategoryFilter } from "@core/entities/interfaces/service-category.entity.interface";

@Injectable()
export class ServiceCategoryRepository extends BaseRepository<ServiceCategoryDocument> implements IServiceCategoryRepository {
    constructor(
        @InjectModel(SERVICE_CATEGORY_MODEL_NAME)
        private readonly _serviceCategoryModel: Model<ServiceCategoryDocument>
    ) {
        super(_serviceCategoryModel);
    }

    async findAllWithFilterWithPagination(filter: IServiceCategoryFilter, options?: { page: number, limit: number }): Promise<ServiceCategoryDocument[]> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;

        const query: FilterQuery<ServiceCategoryDocument> = { isDeleted: false };
        if (filter.search) {
            query.$or = [
                { name: { $regex: filter.search, $options: 'i' } },
                { keywords: { $regex: filter.search, $options: 'i' } }
            ];
        }

        if (filter.isActive && filter.isActive !== 'all') {
            query.isActive = filter.isActive === 'true';
        }

        if (filter.profession && filter.profession !== 'all') {
            query.$expr = {
                $eq: [
                    { $toString: '$professionId' },
                    filter.profession
                ]
            };
        }


        const docs = await this._serviceCategoryModel.aggregate([
            {
                $lookup: {
                    from: 'professions',
                    localField: 'professionId',
                    foreignField: '_id',
                    as: 'profession'
                }
            },
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        return docs;
    }

    async updateCategoryService(serviceCategoryId: string, update: Partial<ServiceCategoryDocument>): Promise<ServiceCategoryDocument | null> {
        return await this._serviceCategoryModel.findByIdAndUpdate(serviceCategoryId, update, { new: true }).lean();
    }

    async toggleStatus(serviceCategoryId: string): Promise<boolean> {
        const result = await this._serviceCategoryModel.findOneAndUpdate(
            { _id: serviceCategoryId },
            [{ $set: { isActive: { $not: "$isActive" } } }],
            { new: true }
        ).lean();
        return !!result;
    }

    async removeServiceCategory(serviceCategoryId: string): Promise<boolean> {
        const result = await this._serviceCategoryModel.deleteOne({ _id: serviceCategoryId });
        return result.deletedCount === 1;
    }

    async count(filter: FilterQuery<ServiceCategoryDocument> = {}): Promise<number> {
        filter.isDeleted = false;
        return await this._serviceCategoryModel.countDocuments(filter);
    }
}
