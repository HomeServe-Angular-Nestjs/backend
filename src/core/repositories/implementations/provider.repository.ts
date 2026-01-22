import { FilterQuery, Model, PipelineStage } from 'mongoose';
import { PROVIDER_MODEL_NAME } from '@core/constants/model.constant';
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

    const baseMatch: FilterQuery<ProviderDocument> = {
      isDeleted: false,
      isActive: true,
    };

    if (filter.search) {
      baseMatch.$or = [
        { fullname: { $regex: filter.search, $options: 'i' } },
        { username: { $regex: filter.search, $options: 'i' } },
        { email: { $regex: filter.search, $options: 'i' } },
        { phone: { $regex: filter.search, $options: 'i' } },
      ];
    }

    if (filter.status === 'best-rated') {
      baseMatch.avgRating = { $gte: 3 };
    }

    if (filter.lat && filter.lng) {
      const pipeline: PipelineStage[] = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [filter.lng, filter.lat], // lng, lat
            },
            key: 'location',
            distanceField: 'distance', // meters
            maxDistance: 50 * 1000, // 50 km
            spherical: true,
            query: baseMatch,
          },
        },
      ];

      if (filter.status === 'nearest') {
        pipeline.push({ $sort: { distance: 1 } });
      }

      pipeline.push(
        { $skip: skip },
        { $limit: limit },
        {
          $addFields: {
            distanceKm: { $divide: ['$distance', 1000] },
          },
        }
      );

      return this._providerModel.aggregate(pipeline);
    }

    return this._providerModel
      .find(baseMatch)
      .skip(skip)
      .limit(limit)
      .lean();
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
