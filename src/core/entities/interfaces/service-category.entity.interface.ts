import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";
import { IPagination } from "@core/entities/interfaces/booking.entity.interface";

export interface IServiceCategory extends IEntity {
    name: string;
    professionId: string;
    keywords: string[];
    isActive: boolean;
    isDeleted: boolean;
}

export interface IServiceCategoryWithPagination {
    services: IServiceCategory[];
    pagination: IPagination;
}

export interface IServiceCategoryFilter {
    search?: string;
    isActive?: string;
    profession?: string;
}