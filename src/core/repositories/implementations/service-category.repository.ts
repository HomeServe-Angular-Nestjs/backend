import { IServiceCategoryRepository } from '@core/repositories/interfaces/service-category-repo.interface';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base/implementations/base.repository';
import { ServiceCategoryDocument } from '@core/schema/service-category';
import { InjectModel } from '@nestjs/mongoose';
import { SERVICE_CATEGORY_MODEL_NAME } from '@core/constants/model.constant';
import { FilterQuery, Model } from 'mongoose';
import { IServiceCategoryFilter } from '@core/entities/interfaces/service-category.entity.interface';

@Injectable()
export class ServiceCategoryRepository extends BaseRepository<ServiceCategoryDocument> implements IServiceCategoryRepository {
  constructor(
    @InjectModel(SERVICE_CATEGORY_MODEL_NAME)
    private readonly _serviceCategoryModel: Model<ServiceCategoryDocument>,
  ) {
    super(_serviceCategoryModel);
  }

  async findAllWithFilterWithPagination(
    filter: IServiceCategoryFilter,
    options?: { page: number; limit: number },
  ): Promise<ServiceCategoryDocument[]> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const query = this._buildQuery(filter);

    const docs = await this._serviceCategoryModel.aggregate([
      {
        $lookup: {
          from: 'professions',
          localField: 'professionId',
          foreignField: '_id',
          as: 'profession',
        },
      },
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return docs;
  }

  async countWithFilter(filter: IServiceCategoryFilter = {}): Promise<number> {
    return await this._serviceCategoryModel.countDocuments(this._buildQuery(filter));
  }

  private _buildQuery(filter: IServiceCategoryFilter): FilterQuery<ServiceCategoryDocument> {
    const query: FilterQuery<ServiceCategoryDocument> = { isDeleted: false };
    if (filter.search) {
      query.$or = [{ name: { $regex: filter.search, $options: 'i' } }, { keywords: { $regex: filter.search, $options: 'i' } }];
    }

    if (filter.isActive === undefined) {
      query.isActive = true;
    } else if (filter.isActive !== 'all') {
      query.isActive = filter.isActive === 'true';
    }

    if (filter.profession && filter.profession !== 'all') {
      query.$expr = {
        $eq: [{ $toString: '$professionId' }, filter.profession],
      };
    }

    return query;
  }

  async updateCategoryService(
    serviceCategoryId: string,
    update: Partial<ServiceCategoryDocument>,
  ): Promise<ServiceCategoryDocument | null> {
    return await this._serviceCategoryModel.findByIdAndUpdate(serviceCategoryId, update, { new: true }).lean();
  }

  async toggleStatus(serviceCategoryId: string): Promise<boolean> {
    const result = await this._serviceCategoryModel
      .findOneAndUpdate({ _id: serviceCategoryId }, [{ $set: { isActive: { $not: '$isActive' } } }], { new: true })
      .lean();
    return !!result;
  }

  async count(filter: FilterQuery<ServiceCategoryDocument> = {}): Promise<number> {
    filter.isDeleted = false;
    return await this._serviceCategoryModel.countDocuments(filter);
  }

  async searchCategories(text: string): Promise<ServiceCategoryDocument[]> {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prefix = `^${escaped}`;

    return this._serviceCategoryModel
      .find({
        isDeleted: false,
        isActive: true,
        $or: [{ name: { $regex: prefix, $options: 'i' } }, { keywords: { $regex: prefix, $options: 'i' } }],
      })
      .lean();
  }

  async fetchAvailableServiceByProfessionId(professionId: string): Promise<ServiceCategoryDocument[]> {
    return await this._serviceCategoryModel
      .find({
        professionId: this._toObjectId(professionId),
        isActive: true,
        isDeleted: false,
      })
      .lean();
  }

  async deactivateByProfessionId(professionId: string): Promise<string[]> {
    const activeCategories = await this._serviceCategoryModel
      .find(
        {
          professionId: this._toObjectId(professionId),
          isActive: true,
          isDeleted: false,
        },
        { _id: 1 },
      )
      .lean();

    if (activeCategories.length === 0) {
      return [];
    }

    await this._serviceCategoryModel.updateMany(
      {
        professionId: this._toObjectId(professionId),
        isActive: true,
        isDeleted: false,
      },
      { $set: { isActive: false } },
    );

    return activeCategories.map((category) => (category._id as { toString(): string }).toString());
  }

  async findByNameAndProfession(name: string, professionId: string, excludeId?: string): Promise<ServiceCategoryDocument | null> {
    const escaped = name.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter: FilterQuery<ServiceCategoryDocument> = {
      name: { $regex: `^${escaped}$`, $options: 'i' },
      professionId: this._toObjectId(professionId),
      isDeleted: false,
    };
    if (excludeId) {
      filter._id = { $ne: this._toObjectId(excludeId) };
    }

    return this._serviceCategoryModel.findOne(filter).lean();
  }
}
