import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";
import { IProfession } from "@core/entities/interfaces/profession.entity.interface";
import { IServiceCategory } from "@core/entities/interfaces/service-category.entity.interface";

export type PricingUnitType = 'hour' | 'day';

export interface IProviderService extends IEntity {
    providerId: string;
    professionId: string | IProfession;
    categoryId: string | IServiceCategory;
    description: string;
    price: number;
    pricingUnit: PricingUnitType;
    image: string;
    estimatedTimeInMinutes: number;
    isActive: boolean;
    isDeleted: boolean;
}


export interface IProviderServiceUI {
    id: string;
    providerId: string;
    profession: Partial<IProfession>;
    category: Partial<IServiceCategory>;
    description: string;
    price: number;
    pricingUnit: PricingUnitType;
    image: string;
    estimatedTimeInMinutes: number;
    isActive: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}