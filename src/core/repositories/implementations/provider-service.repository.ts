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
            .populate('categoryId') as unknown as ProviderServicePopulatedDocument | null;
    }

    async findAllAndPopulateByProviderId(providerId: string, filters: { search?: string, status?: string, sort?: string }, options: { page: number, limit: number }): Promise<ProviderServicePopulatedDocument[]> {
        const skip = (options.page - 1) * options.limit;
        const query: FilterQuery<ProviderServiceDocument> = {
            providerId: this._toObjectId(providerId),
            isDeleted: false
        };

        if (filters.status && filters.status !== 'all') {
            query.isActive = filters.status === 'true';
        }

        const categoryMatch = filters.search
            ? { name: { $regex: filters.search, $options: 'i' } }
            : undefined;

        const sort = this._getSortObject(filters.sort) || { createdAt: -1 };

        const services = await this._providerServiceModel
            .find(query)
            .populate({
                path: 'categoryId',
                match: categoryMatch
            })
            .populate('professionId')
            .sort(sort)
            .skip(skip)
            .limit(options.limit)
            .lean();

        return filters.search
            ? (services.filter(s => s.categoryId) as unknown as ProviderServicePopulatedDocument[])
            : (services as unknown as ProviderServicePopulatedDocument[]);
    }

    async count(filter: FilterQuery<ProviderServiceDocument> = {}): Promise<number> {
        if (filter.providerId) {
            filter.providerId = this._toObjectId(filter.providerId);
        }

        return await this._providerServiceModel.countDocuments({ ...filter, isDeleted: false });
    }

    async updateStatusByServiceId(serviceId: string): Promise<boolean> {
        const updated = await this._providerServiceModel.updateOne(
            { _id: this._toObjectId(serviceId) },
            [{ $set: { isActive: { $not: '$isActive' } } }]
        );
        return updated.modifiedCount === 1;
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
            { _id: this._toObjectId(serviceId) },
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
            isDeleted: false
        }).lean();
    }
}
