import { Injectable } from '@nestjs/common';
import { Provider } from '../../entities/implementation/provider.entity';
import { BaseRepository } from '../base/implementations/base.repository';
import { ProviderDocument } from '../../schema/provider.schema';
import { IProviderRepository } from '../interfaces/provider-repo.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
  PROVIDER_MODEL_NAME,
  SERVICE_OFFERED_MODEL_NAME,
} from '../../constants/model.constant';
import { Model, Types } from 'mongoose';
import { IService } from '../../entities/interfaces/service.entity.interface';
import { ServiceDocument } from '../../schema/service.schema';

@Injectable()
export class ProviderRepository
  extends BaseRepository<Provider, ProviderDocument>
  implements IProviderRepository
{
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

  async fetchOfferedServices(id: string): Promise<IService[] | null> {
    const provider = await this.providerModel
      .findOne({ _id: id }, { servicesOffered: 1 })
      .populate({
        path: 'servicesOffered',
        model: SERVICE_OFFERED_MODEL_NAME,
      })
      .exec();

    return provider && provider.servicesOffered
      ? this.toServiceEntity(provider.servicesOffered as ServiceDocument[])
      : null;
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

  private toServiceEntity(docs: ServiceDocument[]): IService[] {
    return docs.map((doc) => ({
      id: (doc._id as Types.ObjectId).toString(),
      title: doc.title,
      desc: doc.desc,
      image: doc.image,
      subService: doc.subService.map((sub) => ({
        id: (sub._id as Types.ObjectId).toString(),
        title: sub.title,
        desc: sub.desc,
        image: sub.image,
        price: sub.price,
        estimatedTime: sub.estimatedTime,
        tag: sub.tag || '',
        isActive: sub.isActive,
        isDeleted: sub.isDeleted,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      })),
      isActive: doc.isActive,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }
}
