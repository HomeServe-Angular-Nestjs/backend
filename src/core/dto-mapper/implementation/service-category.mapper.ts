import { Injectable } from "@nestjs/common";
import { IServiceCategoryMapper } from "../interface/service-category.mapper.interface";
import { IServiceCategory } from "@core/entities/interfaces/service-category.entity.interface";
import { ServiceCategoryDocument } from "@core/schema/service-category";
import { ServiceCategory } from "@core/entities/implementation/service-category.entity";
import { Types } from "mongoose";

@Injectable()
export class ServiceCategoryMapper implements IServiceCategoryMapper {
    toDocument(dto: IServiceCategory): Partial<ServiceCategoryDocument> {
        return {
            name: dto.name,
            professionId: new Types.ObjectId(dto.professionId),
            keywords: dto.keywords,
            isActive: dto.isActive,
            isDeleted: dto.isDeleted,
        };
    }

    toEntity(doc: ServiceCategoryDocument): IServiceCategory {
        return new ServiceCategory({
            id: (doc._id as Types.ObjectId).toString(),
            name: doc.name,
            professionId: (doc.professionId as Types.ObjectId).toString(),
            keywords: doc.keywords,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            isDeleted: doc.isDeleted,
        });
    }
}
