import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";

export interface IProfession extends IEntity {
    name: string;
    isDeleted: boolean;
    isActive: boolean;
}

export interface IProfessionFilter {
    search?: string;
    isActive?: string;
}