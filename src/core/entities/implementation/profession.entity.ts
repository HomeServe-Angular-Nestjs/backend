import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { IProfession } from "@core/entities/interfaces/profession.entity.interface";

export class Profession extends BaseEntity implements IProfession {
    name: string;
    isActive: boolean;
    isDeleted: boolean;

    constructor(partial: Partial<Profession>) {
        super(partial);
        Object.assign(this, partial);
    }
}