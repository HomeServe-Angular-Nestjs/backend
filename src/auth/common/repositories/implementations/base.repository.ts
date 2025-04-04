import { Document, FilterQuery, Model, UpdateQuery } from "mongoose";
import { IBaseRepository } from "../interfaces/base-repo.interface";
import { IEntity } from "../../entities/interfaces/base/base-entity.entity.interface";

export abstract class BaseRepository<T extends IEntity, TDocument extends Document> implements IBaseRepository<T, TDocument> {
    constructor(protected readonly model: Model<TDocument>) { }

    async create(entity: Omit<T, 'id'>): Promise<T> {
        const doc = await this.model.create(entity);
        return this.toEntity(doc);
    }

    async findByEmail(email: string): Promise<T | null> {
        const result = await this.model.findOne({ email }).exec();
        return result ? this.toEntity(result) : null;
    }

    async findOneAndUpdate(
        query: FilterQuery<TDocument>,
        update: UpdateQuery<TDocument>,
        options?: {
            upsert?: boolean; new?: boolean
        }): Promise<T | null> {

        const result = await this.model.findOneAndUpdate(
            query,
            update,
            { new: true, ...options }
        );

        return result ? this.toEntity(result) : null;
    }

    protected abstract toEntity(doc: TDocument): T;
}