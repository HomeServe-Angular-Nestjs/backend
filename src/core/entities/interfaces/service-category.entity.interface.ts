import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";

export interface IServiceCategory extends IEntity {
    name: string;
    professionId: string;
    keywords: string[];
    isActive: boolean;
    isDeleted: boolean;
}
