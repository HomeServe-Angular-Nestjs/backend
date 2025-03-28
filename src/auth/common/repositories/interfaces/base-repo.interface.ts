import { IEntity } from "../../interfaces/base/base-entity.entity.interface";

export interface IBaseRepository<T extends IEntity> {
    create(entity: Omit<T, 'id'>): Promise<T>;
    findByEmail(email: string): Promise<T | null>;
}