import { ClientSession, Document, FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose';
import { IBaseRepository } from '../interfaces/base-repo.interface';
import { IEntity } from '../../../entities/base/interfaces/base-entity.entity.interface';

export abstract class BaseRepository<T extends IEntity, TDocument extends Document> implements IBaseRepository<T, TDocument> {

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
    },
  ): Promise<T[]> {
    let query = this.model.find(filter);

    if (options?.limit) query = query.limit(options.limit);
    if (options?.skip) query = query.skip(options.skip);
    if (options?.sort) query = query.sort(options.sort);

    const result = await query.exec();
    return result ? result.map((doc) => this.toEntity(doc)) : [];
  }

  async findOne(filter: FilterQuery<TDocument>, session?: ClientSession): Promise<T | null> {
    let query = this.model.findOne(filter);
    if (session) query = query.session(session);

    const result = await query.exec();
    return result ? this.toEntity(result) : null;
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    let result = await this.model.findById(id).exec();
    return result ? this.toEntity(result) : null;
  }

  async findOneAndUpdate(
    query: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: QueryOptions & { session?: ClientSession },
  ): Promise<T | null> {
    const result = await this.model.findOneAndUpdate(query, update, {
      new: true,
      ...options,
    });

    return result ? this.toEntity(result) : null;
  }

  async deleteOne(query: FilterQuery<TDocument>): Promise<{ deletedCount?: number; }> {
    const result = await this.model.deleteOne(query).exec();
    return { deletedCount: result.deletedCount };
  }

  protected abstract toEntity(doc: TDocument): T;
}
