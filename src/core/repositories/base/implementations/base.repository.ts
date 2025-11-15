import {
  ClientSession, Document, FilterQuery, Model, QueryOptions, Types, UpdateQuery
} from 'mongoose';

import { IBaseRepository } from '../interfaces/base-repo.interface';

export abstract class BaseRepository<TDocument extends Document> implements IBaseRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) { }

  async create(doc: Partial<TDocument>): Promise<TDocument> {
    return await this.model.create(doc);
  }

  async find(filter: FilterQuery<TDocument>, options?: { limit?: number; skip?: number; sort?: Record<string, 1 | -1>; }): Promise<TDocument[]> {
    let query = this.model.find(filter);
    if (options?.limit) query = query.limit(options.limit);
    if (options?.skip) query = query.skip(options.skip);
    if (options?.sort) query = query.sort(options.sort);
    return await query.exec();
  }

  async findOne(filter: FilterQuery<TDocument>): Promise<TDocument | null> {
    return await this.model.findOne(filter).exec();
  }

  async findById(id: string | Types.ObjectId): Promise<TDocument | null> {
    return await this.model.findById(id).exec();
  }

  async findOneAndUpdate(
    query: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: QueryOptions & { session?: ClientSession },
  ): Promise<TDocument | null> {
    return await this.model.findOneAndUpdate(query, update, { new: true, ...options });
  }

  async deleteOne(query: FilterQuery<TDocument>): Promise<{ deletedCount?: number }> {
    const result = await this.model.deleteOne(query).exec();
    return { deletedCount: result.deletedCount };
  }

  protected _toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    try {
      if (id instanceof Types.ObjectId) return id;
      return new Types.ObjectId(id);
    } catch {
      throw new Error('Failed to convert id to objectId. Not a valid input.');
    }
  }
}