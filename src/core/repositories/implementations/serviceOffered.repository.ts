import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base/implementations/base.repository';
import { ServiceOffered, SubService } from '../../entities/implementation/service.entity';
import { ServiceDocument } from '../../schema/service.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SERVICE_OFFERED_MODEL_NAME } from '../../constants/model.constant';
import { Model, Types } from 'mongoose';
import { IServiceOfferedRepository } from '../interfaces/serviceOffered-repo.interface';

@Injectable()
export class ServiceOfferedRepository
  extends BaseRepository<ServiceOffered, ServiceDocument>
  implements IServiceOfferedRepository {
  constructor(
    @InjectModel(SERVICE_OFFERED_MODEL_NAME)
    private serviceModel: Model<ServiceDocument>,
  ) {
    super(serviceModel);
  }

  protected toEntity(doc: ServiceDocument): ServiceOffered {
    return new ServiceOffered({
      id: (doc._id as Types.ObjectId).toString(),
      title: doc.title,
      desc: doc.desc,
      image: doc.image,
      subService: doc.subService.map(service => new SubService({
        id: service.id,
        title: service.title,
        desc: service.desc,
        price: service.price,
        estimatedTime: service.estimatedTime,
        image: service.image,
        tag: service.tag,
        isActive: service.isActive,
        // isVerified: service.isVerified,
        isDeleted: service.isDeleted,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      })),
      isActive: doc.isActive,
      isVerified: doc.isVerified,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
