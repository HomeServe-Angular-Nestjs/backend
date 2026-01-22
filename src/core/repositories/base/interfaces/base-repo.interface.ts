import { SortOrder } from 'mongoose';
import { ClientSession, Document, FilterQuery, QueryOptions, Types, UpdateQuery } from 'mongoose';

export interface IBaseRepository<TDocument extends Document> {
  create(doc: Partial<TDocument>): Promise<TDocument>;
  find(filter: FilterQuery<TDocument>, options?: { limit?: number; skip?: number; sort?: Record<string, 1 | -1>; }): Promise<TDocument[]>;
  findOne(filter: FilterQuery<TDocument>): Promise<TDocument | null>;
  findById(id: string | Types.ObjectId): Promise<TDocument | null>;
  findOneAndUpdate(query: FilterQuery<TDocument>, update: UpdateQuery<TDocument>, options?: QueryOptions & { session?: ClientSession }): Promise<TDocument | null>;
  deleteOne(query: FilterQuery<TDocument>): Promise<{ deletedCount?: number }>;
}

export type SortQuery<TDocument> = Partial<Record<keyof TDocument, 1 | -1>>;