import { Injectable } from '@nestjs/common';
import { Provider } from '../../entities/implementation/provider.entity';
import { BaseRepository } from '../base/implementations/base.repository';
import { ProviderDocument } from '../../schema/provider.schema';
import { IProviderRepository } from '../interfaces/provider-repo.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
  PROVIDER_MODEL_NAME,
} from '../../constants/model.constant';
import { FilterQuery, Model, Types } from 'mongoose';
import { IProvider } from '../../entities/interfaces/user.entity.interface';

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
      }))
    });
  }
}
