import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';

import { PROVIDER_MODEL_NAME } from '@core/constants/model.constant';
import { IReportDownloadUserData, IReportProviderData, IStats } from '@core/entities/interfaces/admin.entity.interface';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { ProviderDocument } from '@core/schema/provider.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProviderRepository extends BaseRepository<ProviderDocument> implements IProviderRepository {
  constructor(
    @InjectModel(PROVIDER_MODEL_NAME)
    private _providerModel: Model<ProviderDocument>,
  ) {
    super(_providerModel);
  }

  async findByGoogleId(id: string): Promise<ProviderDocument | null> {
    return await this._providerModel.findOne({ googleId: id });
  }

  async findByEmail(email: string): Promise<ProviderDocument | null> {
    return await this._providerModel.findOne({ email }).lean();
  }

  async count(filter?: FilterQuery<ProviderDocument>): Promise<number> {
    return await this._providerModel.countDocuments(filter);
  }

  async isExists(filter: FilterQuery<ProviderDocument>): Promise<boolean> {
    const result = await this._providerModel.exists(filter);
    return result !== null;
  }

  async getCurrentRatingCountAndAverage(providerId: string): Promise<{ currentRatingCount: number, currentRatingAvg: number } | null> {
    const result = await this._providerModel.findOne({ _id: providerId }, { _id: -1, ratingCount: 1, avgRating: 1 });
    return result ? { currentRatingAvg: result.avgRating, currentRatingCount: result.ratingCount } : null
  }

  async getProvidersBasedOnLocation(lng: number, lat: number): Promise<ProviderDocument[]> {
    const result = await this._providerModel.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: 50000,
          $minDistance: 0
        },
      },
    }).exec();

    return result ? result : [];
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
}
