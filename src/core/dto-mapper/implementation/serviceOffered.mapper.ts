import { IServiceOfferedMapper } from "@core/dto-mapper/interface/serviceOffered.mapper.interface";
import { ServiceOffered, SubService } from "@core/entities/implementation/service.entity";
import { IService } from "@core/entities/interfaces/service.entity.interface";
import { ServiceDocument } from "@core/schema/service.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class ServiceOfferedMapper implements IServiceOfferedMapper {
    toEntity(doc: ServiceDocument): IService {
        return new ServiceOffered({
            id: (doc._id as Types.ObjectId).toString(),
            providerId: doc.providerId.toString(),
            title: doc.title,
            desc: doc.desc,
            image: doc.image,
            subService: doc.subService.map(service => new SubService({
                id: (service._id as Types.ObjectId).toString(),
                title: service.title,
                desc: service.desc,
                price: service.price,
                estimatedTime: service.estimatedTime,
                image: service.image,
                isActive: service.isActive,
                isDeleted: service.isDeleted,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
            })),
            isActive: doc.isActive,
            isVerified: doc.isVerified,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    toDocument(entity: IService): ServiceDocument {
        return {
            providerId: new Types.ObjectId(entity.providerId),
            title: entity.title,
            desc: entity.desc,
            image: entity.image,
            subService: entity && entity.subService
                ? entity.subService.map(service => {
                    return {
                        title: service.title,
                        desc: service.desc,
                        price: service.price,
                        estimatedTime: service.estimatedTime,
                        image: service?.image ?? '',
                        isActive: service.isActive ?? true,
                        isDeleted: service.isDeleted ?? false,
                    }
                })
                : [],
            isActive: entity.isActive ?? true,
            isVerified: entity.isVerified ?? false,
            isDeleted: entity.isDeleted ?? false,
        } as ServiceDocument;
    }
}