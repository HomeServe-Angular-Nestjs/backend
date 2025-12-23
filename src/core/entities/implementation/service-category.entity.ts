import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { IServiceCategory } from "../interfaces/service-category.entity.interface";

export class ServiceCategory extends BaseEntity implements IServiceCategory {
    name: string;
    professionId: string;
    keywords: string[];
    isActive: boolean;
    isDeleted: boolean;

    constructor(partial: Partial<ServiceCategory>) {
        super(partial);
        Object.assign(this, partial);
    }
}
