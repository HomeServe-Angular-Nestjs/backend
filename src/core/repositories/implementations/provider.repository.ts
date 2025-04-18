import { Injectable } from '@nestjs/common';
import { Provider } from '../../entities/implementation/provider.entity';
import { BaseRepository } from '../base/implementations/base.repository';
import { ProviderDocument } from '../../schema/provider.schema';
import { IProviderRepository } from '../interfaces/provider-repo.interface';
import { InjectModel } from '@nestjs/mongoose';
import { PROVIDER_MODEL_NAME, SERVICE_OFFERED_MODEL_NAME } from '../../constants/model.constant';
import { Model, Types } from 'mongoose';
import { ISubService } from '../../entities/interfaces/service.entity.interface';
import { SubServiceDocument } from '../../schema/subservice.schema';

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

  async fetchOfferedServices(id: string): Promise<Provider | null> {
    const provider = await this.providerModel
      .findOne({ _id: id })
      .populate({
        path: 'servicesOffered',
        model: SERVICE_OFFERED_MODEL_NAME
      })
      .exec();

    return provider ? this.toEntity(provider) : null;
  }

  protected toEntity(doc: ProviderDocument): Provider {
    let servicesOffered: string[] | ISubService[] = [];

    // Checking if the servicesOffered field is populated
    if (Array.isArray(doc.servicesOffered) && doc.servicesOffered.length) {
      if (doc.servicesOffered[0] instanceof Types.ObjectId) {
        servicesOffered = doc.servicesOffered.map((id: Types.ObjectId) => id.toString());
      } else {
        servicesOffered = (doc.servicesOffered as SubServiceDocument[]).map(subServiceDoc =>
          this.toServiceEntity(subServiceDoc)
        );
      }
    }

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
      fullname: doc.fullName || '',
      languages: doc.languages ?? [],
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isBlocked: doc.isBlocked,
      isDeleted: doc.isDeleted,
      isVerified: doc.isVerified,
      isCertified: doc.isCertified,
      servicesOffered
    });
  }

  private toServiceEntity(doc: SubServiceDocument): ISubService {
    return {
      id: (doc._id as Types.ObjectId).toString(),
      title: doc.title,
      desc: doc.desc,
      image: doc.image,
      price: doc.price,
      estimatedTime: doc.estimatedTime,
      isActive: doc.isActive,
      tag: doc.tag || '',
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}
