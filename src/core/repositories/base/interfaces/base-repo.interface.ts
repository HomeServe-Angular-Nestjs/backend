import { ClientSession, Document, FilterQuery, QueryOptions, Types, UpdateQuery } from 'mongoose';
import { IEntity } from '../../../entities/base/interfaces/base-entity.entity.interface';


export interface IBaseRepository<T extends IEntity, TDocument extends Document,> {

  create(entity: Omit<T, 'id'>): Promise<T>;

  find(
    filter?: FilterQuery<TDocument>,
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
    },
  ): Promise<T[]>;

  findById(id: string | Types.ObjectId): Promise<T | null>;

  findOne(filter: FilterQuery<TDocument>, session?: ClientSession): Promise<T | null>;

  findOneAndUpdate(
    query: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: QueryOptions & { session?: ClientSession },

  ): Promise<T | null>;

  deleteOne(query: FilterQuery<TDocument>): Promise<{ deletedCount?: number }>;
}
