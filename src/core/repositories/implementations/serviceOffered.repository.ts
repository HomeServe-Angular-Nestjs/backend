import { FilterQuery, Model } from 'mongoose';

import { SERVICE_OFFERED_MODEL_NAME } from '@core/constants/model.constant';
import { IGetServiceTitle } from '@core/entities/interfaces/service.entity.interface';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import {
    IServiceOfferedRepository
} from '@core/repositories/interfaces/serviceOffered-repo.interface';
import { ServiceDocument } from '@core/schema/service.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ServiceOfferedRepository extends BaseRepository<ServiceDocument> implements IServiceOfferedRepository {
  constructor(
    @InjectModel(SERVICE_OFFERED_MODEL_NAME)
    private readonly _serviceModel: Model<ServiceDocument>,
  ) {
    super(_serviceModel);
  }

  async count(filter: FilterQuery<ServiceDocument>): Promise<number> {
    return await this._serviceModel.countDocuments(filter);
  }

  async getServiceTitles(): Promise<IGetServiceTitle[]> {
    const result = await this._serviceModel.find({});
    return (result ?? []).map(doc => ({
      id: doc.id,
      title: doc.title
    }));
  }
}
