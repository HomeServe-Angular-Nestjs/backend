import { Injectable } from '@nestjs/common';
import { Provider, Review } from '../../entities/implementation/provider.entity';
import { BaseRepository } from '../base/implementations/base.repository';
import { ProviderDocument } from '../../schema/provider.schema';
import { IProviderRepository } from '../interfaces/provider-repo.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
  PROVIDER_MODEL_NAME,
} from '../../constants/model.constant';
import { FilterQuery, Model, Types } from 'mongoose';
import { IProvider, IReview } from '../../entities/interfaces/user.entity.interface';

@Injectable()
export class ProviderRepository extends BaseRepository<Provider, ProviderDocument> implements IProviderRepository {
  constructor(
    @InjectModel(PROVIDER_MODEL_NAME)
    private _providerModel: Model<ProviderDocument>,
  ) {
    super(_providerModel);
  }

  async findByGoogleId(id: string): Promise<Provider | null> {
    const provider = await this._providerModel.findOne({ googleId: id });
    return provider ? this.toEntity(provider) : null;
  }

  async findByEmail(email: string): Promise<IProvider | null> {
    const result = await this._providerModel.findOne({ email }).exec();
    return result ? this.toEntity(result) : null;
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

  async getReviews(_id: string): Promise<IReview[]> {
    const provider = await this._providerModel.findOne({ _id });
    return (provider?.reviews || []).map(r => new Review({
      id: (r._id)?.toString(),
      desc: r.desc,
      isReported: r.isReported,
      reviewedBy: r.reviewedBy,
      writtenAt: r.writtenAt,
    })) ?? []
  }

  protected toEntity(doc: ProviderDocument): Provider {
    return new Provider({
      id: (doc._id as Types.ObjectId).toString(),
      email: doc.email,
      username: doc.username,
      password: doc.password,
      googleId: doc.googleId,
      additionalSkills: doc.additionalSkills ?? [],
      avatar: doc.avatar || '',
      awards: doc.awards ?? [],
      bio: doc.bio || '',
      expertise: doc.expertise ?? [],
      fullname: doc.fullname || '',
      languages: doc.languages ?? [],
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isDeleted: doc.isDeleted,
      verificationStatus: doc.verificationStatus,
      isCertified: doc.isCertified,
      servicesOffered: doc.servicesOffered.map((id: Types.ObjectId) =>
        id.toString(),
      ),
      availability: doc.availability,
      experience: doc.experience,
      serviceRadius: doc.serviceRadius,
      profession: doc.profession,
      defaultSlots: doc.defaultSlots,
      schedules: doc.schedules.map(id => id.toString()),
      location: doc.location,
      bookingLimit: doc.bookingLimit,
      bufferTime: doc.bufferTime,
      enableSR: doc.enableSR,
      docs: (doc.docs ?? []).map(d => ({
        id: (doc._id as Types.ObjectId).toString(),
        fileUrl: d.fileUrl,
        isDeleted: d.isDeleted,
        label: d.label,
        uploadedAt: d.uploadedAt,
        verificationStatus: d.verificationStatus,
        verifiedAt: d.verifiedAt
      })),
      ratingCount: doc.ratingCount,
      avgRating: doc.avgRating,
      reviews: doc.reviews
    });
  }
}
