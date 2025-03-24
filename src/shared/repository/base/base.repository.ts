import { Injectable } from "@nestjs/common";
import { IBaseRepository } from "./base.interface";
import { Document, Model } from "mongoose";

@Injectable()
export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    constructor(protected readonly model: Model<T>) { }

    async create(item: Partial<T>): Promise<T> {
        return this.model.create(item);
    }
}