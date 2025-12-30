import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { IProfession } from "@core/entities/interfaces/profession.entity.interface";
import { IProviderService, PricingUnitType } from "@core/entities/interfaces/provider-service.entity.interface";
import { IServiceCategory } from "@core/entities/interfaces/service-category.entity.interface";

export class ProviderService extends BaseEntity implements IProviderService {
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

    constructor(partial: Partial<ProviderService>) {
        super(partial);
        Object.assign(this, partial);
    }
}
