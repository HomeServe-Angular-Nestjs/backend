import { IProviderService, IProviderServiceUI } from "@core/entities/interfaces/provider-service.entity.interface";
import { ProviderServiceDocument, ProviderServicePopulatedDocument } from "@core/schema/provider-service.schema";
import { ProviderService } from "@core/entities/implementation/provider-service.entity";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { IProviderServiceMapper } from "../interface/provider-service.mapper.interface";

@Injectable()
export class ProviderServiceMapper implements IProviderServiceMapper {
    toDocument(entity: IProviderService): Partial<ProviderServiceDocument> {
        return {
            providerId: new Types.ObjectId(entity.providerId),
            professionId: new Types.ObjectId(entity.professionId as string),
            categoryId: new Types.ObjectId(entity.categoryId as string),
            description: entity.description,
            price: entity.price,
            pricingUnit: entity.pricingUnit,
            image: entity.image,
            estimatedTimeInMinutes: entity.estimatedTimeInMinutes,
            isActive: entity.isActive,
            isDeleted: entity.isDeleted,
        };
    }

    toEntity(doc: ProviderServiceDocument): IProviderService {
        return new ProviderService({
            id: (doc._id as Types.ObjectId).toString(),
            providerId: (doc.providerId as Types.ObjectId).toString(),
            professionId: (doc.professionId as Types.ObjectId).toString(),
            categoryId: (doc.categoryId as Types.ObjectId).toString(),
            description: doc.description,
            price: doc.price as number,
            pricingUnit: doc.pricingUnit,
            image: doc.image,
            estimatedTimeInMinutes: doc.estimatedTimeInMinutes as number,
            isActive: doc.isActive,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    toPopulatedEntity(doc: ProviderServicePopulatedDocument): IProviderServiceUI {
        return {
            id: (doc._id as Types.ObjectId).toString(),
            providerId: (doc.providerId as Types.ObjectId).toString(),
            profession: {
                id: (doc.professionId._id as Types.ObjectId).toString(),
                name: doc.professionId.name,
            },
            category: {
                id: (doc.categoryId._id as Types.ObjectId).toString(),
                name: doc.categoryId.name,
            },
            description: doc.description,
            price: doc.price as number,
            pricingUnit: doc.pricingUnit,
            image: doc.image,
            estimatedTimeInMinutes: doc.estimatedTimeInMinutes as number,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
}
