import { IProfessionFilter } from "@core/entities/interfaces/profession.entity.interface";
import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { ProfessionDocument } from "@core/schema/profession.schema";
import { ServiceCategoryDocument } from "@core/schema/service-category";
import { FilterQuery } from "mongoose";

export interface IProfessionRepository extends IBaseRepository<ProfessionDocument> {
    update(professionId: string, update: Partial<ProfessionDocument>): Promise<ProfessionDocument | null>;
    findAllWithFilter(filter: IProfessionFilter): Promise<ProfessionDocument[]>;
    toggleStatus(id: string): Promise<boolean>;
    removeProfession(id: string): Promise<boolean>;
    count(filter?: FilterQuery<ServiceCategoryDocument>): Promise<number>;
}