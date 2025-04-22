import { Document, FilterQuery, UpdateQuery } from 'mongoose';
import { IEntity } from '../../../entities/base/interfaces/base-entity.entity.interface';

export interface IBaseRepository<
  T extends IEntity,
  TDocument extends Document,
> {
  create(entity: Omit<T, 'id'>): Promise<T>;

  find(
    filter?: FilterQuery<TDocument>,
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
      populate?: string | string[];
    },
  ): Promise<T[]>;

  findByEmail(email: string): Promise<T | null>;

  findOne(filter: FilterQuery<TDocument>): Promise<T | null>;

  findOneAndUpdate(
    query: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: {
      upsert?: boolean;
      new?: boolean;
      populate?: string | string[];
    },
  ): Promise<T | null>;
}
