import { Document } from "mongoose";

export interface IBaseRepository<T extends Document> {
    create(item: Partial<T>): Promise<T>;
}