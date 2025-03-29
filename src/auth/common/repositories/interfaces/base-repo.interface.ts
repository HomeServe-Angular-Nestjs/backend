import { Document, FilterQuery, UpdateQuery } from "mongoose";
import { IEntity } from "../../entities/interfaces/base/base-entity.entity.interface";

export interface IBaseRepository<T extends IEntity, TDocument extends Document> {
    create(entity: Omit<T, 'id'>): Promise<T>;
    findByEmail(email: string): Promise<T | null>;
    findOneAndUpdate(
        query: FilterQuery<TDocument>,
        update: UpdateQuery<TDocument>,
        options?: {
            upsert?: boolean;
            new?: boolean
        }
    ): Promise<T | null>;
}