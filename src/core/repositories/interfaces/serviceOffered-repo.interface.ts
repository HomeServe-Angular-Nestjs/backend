import type { FilterQuery } from 'mongoose';
import type { IGetServiceTitle } from '@core/entities/interfaces/service.entity.interface';
import type { ServiceDocument } from '@core/schema/service.schema';
import type { SubServiceDocument } from '@core/schema/subservice.schema';
import type { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';

export interface IServiceOfferedRepository extends IBaseRepository<ServiceDocument> {
  findSubServicesByIds(ids: string[]): Promise<SubServiceDocument[]>;
  count(filter: FilterQuery<ServiceDocument>): Promise<number>;
  getServiceTitles(): Promise<IGetServiceTitle[]>;
  getActiveServiceCount(providerId: string): Promise<number>;
  searchServiceByTitle(title: string): Promise<ServiceDocument[]>;
}
