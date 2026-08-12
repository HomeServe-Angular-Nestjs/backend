import { PROVIDER_SERVICE_MODEL_NAME } from "@core/constants/model.constant";
import { ProviderServiceDocument, ProviderServicePopulatedDocument } from "@core/schema/provider-service.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, PipelineStage, Types } from "mongoose";
import { BaseRepository } from "../base/implementations/base.repository";
import { IProviderServiceRepository } from "../interfaces/provider-service-repo.interface";
import { IProviderService } from "@core/entities/interfaces/provider-service.entity.interface";

@Injectable()
export class ProviderServiceRepository extends BaseRepository<ProviderServiceDocument> implements IProviderServiceRepository {
    constructor(
        @InjectModel(PROVIDER_SERVICE_MODEL_NAME)
        private readonly _providerServiceModel: Model<ProviderServiceDocument>
    ) {
        super(_providerServiceModel);
    }

    private _getSortObject(sort?: string): any {
        switch (sort) {
            case 'latest': return { createdAt: -1 };
            case 'oldest': return { createdAt: 1 };
            case 'price_high_to_low': return { price: -1 };
            case 'price_low_to_high': return { price: 1 };
            default: return { createdAt: -1 };
        }
    }

    async createAndPopulate(doc: ProviderServiceDocument): Promise<ProviderServicePopulatedDocument> {
        const created = await this._providerServiceModel.create(doc);
        const populated = await this._providerServiceModel.findById(created._id)
            .populate('professionId')
            .populate('categoryId')
            .exec();

        return populated as unknown as ProviderServicePopulatedDocument;
    }

    async updateAndPopulateByServiceId(serviceId: string, update: Partial<IProviderService>): Promise<ProviderServicePopulatedDocument | null> {
        return await this._providerServiceModel.findByIdAndUpdate(
            serviceId,
            { $set: update },
            { new: true })
            .populate('professionId')
            .populate('categoryId')
            .lean<ProviderServicePopulatedDocument | null>()
    }

    async findAllAndPopulateByProviderId(providerId: string, filters: { search?: string, status?: string, sort?: string }, options: { page: number, limit: number }, activeOnly = false): Promise<{ services: ProviderServicePopulatedDocument[]; total: number }> {
        const skip = (options.page - 1) * options.limit;
        const query: FilterQuery<ProviderServiceDocument> = {
            providerId: this._toObjectId(providerId),
            isDeleted: false
        };

        if (filters.status && filters.status !== 'all') {
            query.isActive = filters.status === 'true';
        } else if (activeOnly) {
            query.isActive = true;
        }

        const sort = this._getSortObject(filters.sort) || { createdAt: -1 };

        if (!filters.search) {
            if (activeOnly) {
                const [facet] = await this._providerServiceModel.aggregate<{
                    total: { count: number }[];
                    docs: ProviderServicePopulatedDocument[];
                }>([
                    { $match: query },
                    {
                        $lookup: {
                            from: 'servicecategories',
                            localField: 'categoryId',
                            foreignField: '_id',
                            as: 'categoryId'
                        }
                    },
                    { $unwind: { path: '$categoryId' } },
                    {
                        $lookup: {
                            from: 'professions',
                            localField: 'professionId',
                            foreignField: '_id',
                            as: 'professionId'
                        }
                    },
                    { $unwind: { path: '$professionId' } },
                    {
                        $match: {
                            'categoryId.isActive': true,
                            'categoryId.isDeleted': false,
                            'professionId.isActive': true,
                            'professionId.isDeleted': false,
                        }
                    },
                    { $sort: sort },
                    {
                        $facet: {
                            total: [{ $count: 'count' }],
                            docs: [
                                { $skip: skip },
                                { $limit: options.limit }
                            ]
                        }
                    }
                ]);

                return {
                    services: facet?.docs ?? [],
                    total: facet?.total?.[0]?.count ?? 0
                };
            }

            const total = await this._providerServiceModel.countDocuments(query);
            const services = await this._providerServiceModel
                .find(query)
                .populate('categoryId')
                .populate('professionId')
                .sort(sort)
                .skip(skip)
                .limit(options.limit)
                .lean<ProviderServicePopulatedDocument[]>();

            return { services, total };
        }

        const pipeline: PipelineStage[] = [
            { $match: query },
            {
                $lookup: {
                    from: 'servicecategories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryId'
                }
            },
            { $unwind: { path: '$categoryId' } },
            { $match: { 'categoryId.name': { $regex: filters.search, $options: 'i' } } },
            {
                $lookup: {
                    from: 'professions',
                    localField: 'professionId',
                    foreignField: '_id',
                    as: 'professionId'
                }
            },
            { $unwind: { path: '$professionId' } },
            ...(activeOnly ? [{ $match: { 'categoryId.isActive': true, 'categoryId.isDeleted': false, 'professionId.isActive': true, 'professionId.isDeleted': false } }] : []),
            { $sort: sort },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    docs: [
                        { $skip: skip },
                        { $limit: options.limit }
                    ]
                }
            }
        ];

        const [result] = await this._providerServiceModel.aggregate<{
            total: { count: number }[];
            docs: ProviderServicePopulatedDocument[];
        }>(pipeline);

        return {
            services: result?.docs ?? [],
            total: result?.total?.[0]?.count ?? 0
        };
    }

    async count(filter: FilterQuery<ProviderServiceDocument> = {}): Promise<number> {
        if (filter.providerId) {
            filter.providerId = this._toObjectId(filter.providerId);
        }

        return await this._providerServiceModel.countDocuments({ ...filter, isDeleted: false });
    }

    async updateStatusByServiceId(serviceId: string): Promise<boolean> {
        const updated = await this._providerServiceModel.updateOne(
            { _id: this._toObjectId(serviceId), isDeleted: false },
            [{ $set: { isActive: { $not: '$isActive' } } }]
        );
        return updated.modifiedCount > 0;
    }

    async isServiceExist(serviceId: string): Promise<boolean> {
        const result = await this._providerServiceModel.exists({
            _id: new Types.ObjectId(serviceId),
            isDeleted: false
        });
        return !!result;
    }

    async isServiceExistByCategoryId(providerId: string, categoryId: string): Promise<boolean> {
        const result = await this._providerServiceModel.exists({
            providerId: new Types.ObjectId(providerId),
            categoryId: new Types.ObjectId(categoryId),
            isDeleted: false
        });
        return !!result;
    }

    async deleteService(serviceId: string): Promise<boolean> {
        const deleted = await this._providerServiceModel.findOneAndUpdate(
            { _id: this._toObjectId(serviceId), isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );
        return deleted?.isDeleted ?? false;
    }

    async findByIds(ids: string[]): Promise<ProviderServiceDocument[]> {
        return await this._providerServiceModel.find({
            _id: { $in: ids.map(id => new Types.ObjectId(id)) },
            isDeleted: false
        }).exec();
    }

    async findOneAndPopulateById(serviceId: string): Promise<ProviderServicePopulatedDocument | null> {
        return await this._providerServiceModel.findById(serviceId)
            .populate('professionId')
            .populate('categoryId') as unknown as ProviderServicePopulatedDocument | null;
    }

    async findByCategoryId(categoryId: string): Promise<ProviderServiceDocument[]> {
        return await this._providerServiceModel.find({
            categoryId: new Types.ObjectId(categoryId),
            isActive: true,
            isDeleted: false
        }).lean();
    }

    async deactivateByCategoryIds(categoryIds: string[]): Promise<void> {
        await this._providerServiceModel.updateMany(
            {
                categoryId: { $in: categoryIds.map(id => new Types.ObjectId(id)) },
                isActive: true,
                isDeleted: false
            },
            { $set: { isActive: false } }
        );
    }
}
