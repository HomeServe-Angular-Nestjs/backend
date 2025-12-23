import { IProfession } from "@core/entities/interfaces/profession.entity.interface";
import { ProfessionDocument } from "@core/schema/profession.schema";

export interface IProfessionMapper {
    toEntity(document: ProfessionDocument): IProfession;
    toDocument(dto: IProfession): Partial<ProfessionDocument>;
}