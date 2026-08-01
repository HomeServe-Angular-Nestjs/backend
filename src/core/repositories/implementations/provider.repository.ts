import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { PROVIDER_MODEL_NAME } from '@core/constants/model.constant';
import { IReportDownloadUserData, IReportProviderData, IStats } from '@core/entities/interfaces/admin.entity.interface';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { ProviderDocument } from '@core/schema/provider.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Availability, IFilterFetchProviders } from '@core/entities/interfaces/user.entity.interface';

const SEARCH_RADIUS_KM = 50;
const EARTH_RADIUS_KM = 6378.1;

@Injectable()
export class ProviderRepository extends BaseRepository<ProviderDocument> implements IProviderRepository {
  constructor(
    @InjectModel(PROVIDER_MODEL_NAME)
    private _providerModel: Model<ProviderDocument>,
  ) {
    super(_providerModel);
  }

  private _buildBaseMatch(filter: IFilterFetchProviders): FilterQuery<ProviderDocument> {
    const baseMatch: FilterQuery<ProviderDocument> = {
      isDeleted: false,
      isActive: true,
    };

    const searchOr: FilterQuery<ProviderDocument>[] = [];

    if (filter.search) {
      const regex = this._escapeRegex(filter.search);
      searchOr.push(
        { fullname: { $regex: regex, $options: 'i' } },
        { username: { $regex: regex, $options: 'i' } },
        { email: { $regex: regex, $options: 'i' } },
        { phone: { $regex: regex, $options: 'i' } },
        { profession: { $regex: regex, $options: 'i' } },
      );
    }

    if (searchOr.length) {
      baseMatch.$and = [...(baseMatch.$and ?? []), { $or: searchOr }];
    }

    if (filter.status === 'best-rated') {
      baseMatch.avgRating = { $gte: 3 };
    }

    if (filter.providerIds?.length) {
      baseMatch._id = {
        $in: filter.providerIds.map(id => new Types.ObjectId(id)),
      };
    }

    return baseMatch;
  }

  private async _applyLocationOrMatch(filter: IFilterFetchProviders, baseMatch: FilterQuery<ProviderDocument>): Promise<void> {
    if (!filter.address || !filter.lat || !filter.lng) return;

    const lat = filter.lat as number;
    const lng = filter.lng as number;
    const addressRegex = this._escapeRegex(filter.address);

    const { _id, ...rest } = baseMatch;

    const branch = (extra: FilterQuery<ProviderDocument>): FilterQuery<ProviderDocument> => {
      const query: FilterQuery<ProviderDocument> = { ...rest, ...extra };
      if (_id) query._id = _id;
      return query;
    };

    const [byAddress, byGeo] = await Promise.all([
      this._providerModel.find(
        branch({ address: { $regex: addressRegex, $options: 'i' } })
      ).select('_id').lean(),
      this._providerModel.find(
        branch({
          location: {
            $geoWithin: {
              $centerSphere: [
                [lng, lat],
                SEARCH_RADIUS_KM / EARTH_RADIUS_KM,
              ],
            },
          },
        })
      ).select('_id').lean(),
    ]);

    const union = new Set<string>();
    [...byAddress, ...byGeo].forEach(doc => union.add(doc._id.toString()));

    baseMatch._id = { $in: [...union].map(id => new Types.ObjectId(id)) };
  }

  private _escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async findByGoogleId(googleId: string): Promise<ProviderDocument | null> {
    return await this._providerModel.findOne({ googleId });
  }

  async updateGoogleId(email: string, googleId: string): Promise<ProviderDocument | null> {
    return await this._providerModel.findOneAndUpdate(
      { email },
      { $set: { googleId, lastLogin: new Date() } },
      { new: true }
    );
  }

  async findByEmail(email: string): Promise<ProviderDocument | null> {
    return await this._providerModel.findOne({ email }).lean();
  }

  async updatePassword(email: string, hashedPassword: string): Promise<ProviderDocument | null> {
    return await this._providerModel.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true }
    ).lean();
  }

  async count(filter?: FilterQuery<ProviderDocument>): Promise<number> {
    return await this._providerModel.countDocuments(filter);
  }

  async updateLastLogin(email: string): Promise<void> {
    await this._providerModel.updateOne({ email }, { $set: { lastLogin: new Date() } });
  }

  async isExists(filter: FilterQuery<ProviderDocument>): Promise<boolean> {
    const result = await this._providerModel.exists(filter);
    return result !== null;
  }

  async fetchProvidersByFilterWithPagination(filter: IFilterFetchProviders, options: { page: number; limit: number; }): Promise<ProviderDocument[]> {
    const limit = options.limit || 10;
    const skip = (options.page - 1) * limit;

    const baseMatch = this._buildBaseMatch(filter);

    // OR(address text, coordinates within radius) for location-based search
    if (filter.address && filter.lat && filter.lng) {
      await this._applyLocationOrMatch(filter, baseMatch);
    }

    const hasGeo = !!filter.lat && !!filter.lng;

    // "nearest" needs distance-based sorting → $geoNear pipeline
    if (filter.status === 'nearest' && hasGeo) {
      const lat = filter.lat as number;
      const lng = filter.lng as number;

      const matchingIds = await this._providerModel.find(baseMatch).select('_id').lean();
      const ids = matchingIds.map(doc => doc._id);

      if (!ids.length) return [];

      const pipeline: PipelineStage[] = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [lng, lat], // lng, lat
            },
            key: 'location',
            distanceField: 'distance', // meters
            spherical: true,
            query: { _id: { $in: ids } },
          },
        },
        { $sort: { distance: 1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $addFields: {
            distanceKm: { $divide: ['$distance', 1000] },
          },
        }
      ];

      return this._providerModel.aggregate(pipeline);
    }

    return this._providerModel
      .find(baseMatch)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countProvidersByFilter(filter: IFilterFetchProviders): Promise<number> {
    const baseMatch = this._buildBaseMatch(filter);

    if (filter.address && filter.lat && filter.lng) {
      await this._applyLocationOrMatch(filter, baseMatch);
    }

    return this._providerModel.countDocuments(baseMatch);
  }

  
  async addWorkImage(providerId: string, publicId: string): Promise<ProviderDocument | null> {
    const result = await this._providerModel.findOneAndUpdate(
      { _id: providerId },
      {
        $push: {
          workImages: {
            $each: [publicId],
            $position: 0
          }
        }
      },
      { new: true }
    );

    return result ? result : null;
  }

  async getWorkImages(providerId: string): Promise<string[]> {
    const result = await this._providerModel.findOne(
      { _id: providerId },
      { workImages: 1 }
    );
    return result ? result.workImages : [];
  }

  async getProviderStatistics(): Promise<IStats> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const result = await this._providerModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', sevenDaysAgo] }, 1, 0]
            }
          },
          active: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$lastLoggedIn', startOfToday] },
                    { $lte: ['$lastLoggedIn', endOfToday] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    return result.length > 0 ? result[0] : { new: 0, total: 0, active: 0 };
  }

  async generateProviderReport(data: Partial<IReportDownloadUserData>): Promise<IReportProviderData[]> {
    const pipeline: PipelineStage[] = [];

    const match: FilterQuery<ProviderDocument> = { isDeleted: false };

    if (data.fromDate && data.toDate) {
      match.createdAt = {
        $gte: new Date(data.fromDate),
        $lte: new Date(data.toDate)
      };
    }

    if (data.status) {
      match.isActive = data.status;
    }

    // Generating $match stage.
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    // Generating $addFields stage.
    pipeline.push(
      {
        $addFields: {
          totalReviews: {
            $size: { $ifNull: ["$reviews", []] }
          },
          totalServiceListed: {
            $size: { $ifNull: ["$servicesOffered", []] }
          }
        }
      }
    );

    // Generating $sort stage.
    pipeline.push({ $sort: { createdAt: -1 } });

    // Generating $project stage.
    pipeline.push(
      {
        $project: {
          id: '$_id',
          email: '$email',
          username: '$username',
          fullname: '$fullname',
          phone: '$phone',
          date: '$createdAt',
          profession: 1,
          experience: 1,
          isCertified: 1,
          avgRating: 1,
          totalServiceListed: 1,
          totalReviews: 1
        }
      }
    );

    return this._providerModel.aggregate(pipeline).exec();
  }

  async updateSubscriptionId(providerId: string, subscriptionId: string): Promise<boolean> {
    const result = await this._providerModel.updateOne(
      { _id: providerId },
      { $set: { subscriptionId } }
    );

    return result.modifiedCount === 1;
  }

  async updatePasswordById(providerId: string, password: string): Promise<boolean> {
    const result = await this._providerModel.updateOne(
      { _id: providerId },
      {
        $set: { password }
      }
    );

    return result.modifiedCount === 1;
  }

  async getWorkingHours(providerId: string): Promise<Availability | null> {
    const provider = await this._providerModel.findById(providerId).lean();
    return provider?.availability ?? null;
  }

  async updateBufferTime(providerId: string, bufferTime: number): Promise<ProviderDocument | null> {
    return await this._providerModel.findOneAndUpdate(
      { _id: providerId },
      { $set: { bufferTime } },
      { new: true }
    );
  }

  async getBufferTime(providerId: string): Promise<number> {
    const provider = await this._providerModel.findById(providerId)
      .select('bufferTime')
      .lean();
    return provider?.bufferTime ?? 0;
  }
}
