import { Injectable } from '@nestjs/common';
import { Provider } from '../../entities/implementation/provider.entity';
import { BaseRepository } from '../base/implementations/base.repository';
import { ProviderDocument } from '../../schema/provider.schema';
import { IProviderRepository } from '../interfaces/provider-repo.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
  PROVIDER_MODEL_NAME,
} from '../../constants/model.constant';
import { Model, Types } from 'mongoose';

@Injectable()
export class ProviderRepository
  extends BaseRepository<Provider, ProviderDocument>
  implements IProviderRepository {
  constructor(
    @InjectModel(PROVIDER_MODEL_NAME)
    private providerModel: Model<ProviderDocument>,
  ) {
    super(providerModel);
  }

  async findByGoogleId(id: string): Promise<Provider | null> {
    const provider = await this.providerModel.findOne({ googleId: id });
    return provider ? this.toEntity(provider) : null;
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
      isBlocked: doc.isBlocked,
      isDeleted: doc.isDeleted,
      isVerified: doc.isVerified,
      isCertified: doc.isCertified,
      servicesOffered: doc.servicesOffered.map((id: Types.ObjectId) =>
        id.toString(),
      ),
      availability: doc.availability,
      experience: doc.experience,
      serviceRadius: doc.serviceRadius,
      profession: doc.profession,
    });
  }
}
