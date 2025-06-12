import { FilterQuery } from 'mongoose';
import { ServiceOffered } from '../../entities/implementation/service.entity';
import { ServiceDocument } from '../../schema/service.schema';
import { BaseRepository } from '../base/implementations/base.repository';

export interface IServiceOfferedRepository extends BaseRepository<ServiceOffered, ServiceDocument> {
  count(filter: FilterQuery<ServiceDocument>): Promise<number>;
}
