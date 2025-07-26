import { FilterQuery } from 'mongoose';

import { IGetServiceTitle } from '@core/entities/interfaces/service.entity.interface';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { ServiceDocument } from '@core/schema/service.schema';

export interface IServiceOfferedRepository extends BaseRepository<ServiceDocument> {
  count(filter: FilterQuery<ServiceDocument>): Promise<number>;
  getServiceTitles(): Promise<IGetServiceTitle[]>;
}
