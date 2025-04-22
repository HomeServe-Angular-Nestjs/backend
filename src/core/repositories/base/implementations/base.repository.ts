import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { IBaseRepository } from '../interfaces/base-repo.interface';
import { IEntity } from '../../../entities/base/interfaces/base-entity.entity.interface';

export abstract class BaseRepository<
  T extends IEntity,
  TDocument extends Document,
> implements IBaseRepository<T, TDocument> {
  constructor(protected readonly model: Model<TDocument>) { }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    const doc = await this.model.create(entity);
    return this.toEntity(doc);
  }

  async find(
    filter: FilterQuery<TDocument> = {},
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
      populate?: string | string[];
    },
  ): Promise<T[]> {
    let query = this.model.find(filter).lean();

    if (options?.limit) query = query.limit(options.limit);
    if (options?.skip) query = query.skip(options.skip);
    if (options?.sort) query = query.sort(options.sort);
    if (options?.populate) query = query.populate(options.populate);

    const result = await query.exec();
    return result ? result.map((doc) => this.toEntity(doc)) : [];
  }

  async findByEmail(email: string): Promise<T | null> {
    const result = await this.model.findOne({ email }).exec();
    return result ? this.toEntity(result) : null;
  }

  async findOne(filter: FilterQuery<TDocument>): Promise<T | null> {
    const result = await this.model.findOne(filter);
    return result ? this.toEntity(result) : null
  }

  async findOneAndUpdate(
    query: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: {
      upsert?: boolean;
      new?: boolean;
    },
  ): Promise<T | null> {
    const result = await this.model.findOneAndUpdate(query, update, {
      new: true,
      ...options,
    });

    return result ? this.toEntity(result) : null;
  }

  protected abstract toEntity(doc: TDocument | Record<string, any>): T;
}
