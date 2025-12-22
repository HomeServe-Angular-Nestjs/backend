import { Injectable } from "@nestjs/common";
import { IProfessionMapper } from "../interface/profession.mapper.interface";
import { IProfession } from "@core/entities/interfaces/profession.entity.interface";
import { ProfessionDocument } from "@core/schema/profession.schema";
import { Profession } from "@core/entities/implementation/profession.entity";
import { Types } from "mongoose";

@Injectable()
export class ProfessionMapper implements IProfessionMapper {
    toDocument(dto: IProfession): Partial<ProfessionDocument> {
        return {
            isDeleted: dto.isDeleted,
            name: dto.name,
            isActive: dto.isActive,
        };
    }

    toEntity(doc: ProfessionDocument): IProfession {
        return new Profession({
            id: (doc._id as Types.ObjectId).toString(),
            name: doc.name,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            isDeleted: doc.isDeleted,
        });
    }
}