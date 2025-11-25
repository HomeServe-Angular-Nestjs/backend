import { FilterQuery } from 'mongoose';
import { IGetServiceTitle } from '@core/entities/interfaces/service.entity.interface';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { ServiceDocument } from '@core/schema/service.schema';
import { SubServiceDocument } from '@core/schema/subservice.schema';

export interface IServiceOfferedRepository extends BaseRepository<ServiceDocument> {
  findSubServicesByIds(ids: string[]): Promise<SubServiceDocument[]>;
  count(filter: FilterQuery<ServiceDocument>): Promise<number>;
  getServiceTitles(): Promise<IGetServiceTitle[]>;
  getActiveServiceCount(providerId: string): Promise<number>;
  searchServiceByTitle(title: string): Promise<ServiceDocument[]>;
}
