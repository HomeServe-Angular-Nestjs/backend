import { FilterQuery, Model, Types } from 'mongoose';

import { PROVIDER_MODEL_NAME } from '@core/constants/model.constant';
import { IStats } from '@core/entities/interfaces/admin.entity.interface';
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
    return await this._providerModel.findOne({ email }).exec();
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

  // protected toEntity(doc: ProviderDocument): Provider {
  //   return new Provider({
  //     id: (doc._id as Types.ObjectId).toString(),
  //     email: doc.email,
  //     username: doc.username,
  //     password: doc.password,
  //     googleId: doc.googleId,
  //     additionalSkills: doc.additionalSkills ?? [],
  //     avatar: doc.avatar || '',
  //     awards: doc.awards ?? [],
  //     bio: doc.bio || '',
  //     expertise: doc.expertise ?? [],
  //     fullname: doc.fullname || '',
  //     languages: doc.languages ?? [],
  //     isActive: doc.isActive,
  //     createdAt: doc.createdAt,
  //     updatedAt: doc.updatedAt,
  //     isDeleted: doc.isDeleted,
  //     verificationStatus: doc.verificationStatus,
  //     isCertified: doc.isCertified,
  //     servicesOffered: doc.servicesOffered.map((id: Types.ObjectId) =>
  //       id.toString(),
  //     ),
  //     availability: doc.availability,
  //     experience: doc.experience,
  //     serviceRadius: doc.serviceRadius,
  //     profession: doc.profession,
  //     defaultSlots: doc.defaultSlots,
  //     schedules: doc.schedules.map(id => id.toString()),
  //     location: doc.location,
  //     address: doc.address,
  //     bookingLimit: doc.bookingLimit,
  //     bufferTime: doc.bufferTime,
  //     enableSR: doc.enableSR,
  //     docs: (doc.docs ?? []).map(d => ({
  //       id: (doc._id as Types.ObjectId).toString(),
  //       fileUrl: d.fileUrl,
  //       isDeleted: d.isDeleted,
  //       label: d.label,
  //       uploadedAt: d.uploadedAt,
  //       verificationStatus: d.verificationStatus,
  //       verifiedAt: d.verifiedAt
  //     })),
  //     ratingCount: doc.ratingCount,
  //     avgRating: doc.avgRating,
  //     reviews: doc.reviews,
  //     workImages: doc.workImages,
  //   });
  // }
}
