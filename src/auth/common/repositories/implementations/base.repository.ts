import { Document, Model } from "mongoose";
import { IEntity } from "../../interfaces/entity.interface";
import { IBaseRepository } from "../interfaces/base-repo.interface";

export abstract class BaseRepository<T extends IEntity, TDocument extends Document> implements IBaseRepository<T> {
    constructor(protected readonly model: Model<TDocument>) { }

    async create(entity: Omit<T, 'id'>): Promise<T> {
        console.log(entity)
        const doc = await this.model.create(entity);
        console.log(doc)
        return this.toEntity(doc);
    }

    async findByEmail(email: string): Promise<T | null> {
        const result = await this.model.findOne({ email }).exec();
        return result ? this.toEntity(result) : null;
    }

    protected abstract toEntity(doc: TDocument): T;
}