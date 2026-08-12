import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { PROVIDER_MODEL_NAME } from '@core/constants/model.constant';
import { GeoEnum } from '@core/enum/geo.enum';
import { IReportDownloadUserData, IReportProviderData, IStats } from '@core/entities/interfaces/admin.entity.interface';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { ProviderDocument } from '@core/schema/provider.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Availability, IFilterFetchProviders } from '@core/entities/interfaces/user.entity.interface';

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

  private _searchPriorityStages(): PipelineStage[] {
    const now = new Date();

    return [
      {
        $lookup: {
          from: 'subscriptions',
          localField: '_id',
          foreignField: 'userId',
          as: 'subs'
        }
      },
      {
        $addFields: {
          activePriority: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: '$subs',
                      cond: {
                        $and: [
                          { $eq: ['$$this.isActive', true] },
                          { $eq: ['$$this.isDeleted', false] },
                          { $eq: ['$$this.paymentStatus', 'paid'] },
                          { $eq: ['$$this.role', 'provider'] },
                          { $lte: ['$$this.startTime', now] },
                          { $gte: ['$$this.endDate', now] }
                        ]
                      }
                    }
                  },
                  as: 's',
                  in: '$$s.features.search_priority'
                }
              },
              0
            ]
          }
        }
      },
      {
        $addFields: {
          priorityRank: {
            $switch: {
              branches: [
                { case: { $eq: ['$activePriority', 'high'] }, then: 0 },
                { case: { $eq: ['$activePriority', 'medium'] }, then: 1 },
                { case: { $eq: ['$activePriority', 'low'] }, then: 2 }
              ],
              default: 3
            }
          }
        }
      }
    ];
  }

  private _geoNearStages(
    filter: IFilterFetchProviders,
    baseMatch: FilterQuery<ProviderDocument>,
    searchRadiusMeters: number,
  ): PipelineStage[] {
    const lat = filter.lat as number;
    const lng = filter.lng as number;

    return [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          key: 'location',
          distanceField: 'distance',
          spherical: true,
          maxDistance: searchRadiusMeters,
          query: baseMatch,
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              { $lte: [{ $ifNull: ['$serviceRadius', 0] }, 0] },
              { $lte: ['$distance', { $multiply: ['$serviceRadius', GeoEnum.KM_TO_METERS] }] },
            ],
          },
        },
      },
    ];
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

  async fetchProvidersByFilterWithPagination(
    filter: IFilterFetchProviders,
    options: { page: number; limit: number; },
    searchRadiusMeters: number,
  ): Promise<ProviderDocument[]> {
    const limit = options.limit || 10;
    const skip = (options.page - 1) * limit;

    const baseMatch = this._buildBaseMatch(filter);

    if (!filter.lat || !filter.lng) {
      const pipeline: PipelineStage[] = [
        { $match: baseMatch },
        ...this._searchPriorityStages(),
        { $sort: { priorityRank: 1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ];
      return this._providerModel.aggregate(pipeline);
    }

    const pipeline: PipelineStage[] = [
      ...this._geoNearStages(filter, baseMatch, searchRadiusMeters),
      ...this._searchPriorityStages(),
      { $sort: { distance: 1, priorityRank: 1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $addFields: {
          distanceKm: { $divide: ['$distance', GeoEnum.KM_TO_METERS] },
        },
      },
    ];

    return this._providerModel.aggregate(pipeline);
  }

  async countProvidersByFilter(filter: IFilterFetchProviders, searchRadiusMeters: number): Promise<number> {
    const baseMatch = this._buildBaseMatch(filter);

    if (filter.lat && filter.lng) {
      const pipeline: PipelineStage[] = [
        ...this._geoNearStages(filter, baseMatch, searchRadiusMeters),
        { $count: 'total' },
      ];
      const [result] = await this._providerModel.aggregate<{ total: number }>(pipeline);
      return result?.total ?? 0;
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
