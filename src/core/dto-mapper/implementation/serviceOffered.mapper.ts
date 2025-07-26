import { IServiceOfferedMapper } from "@core/dto-mapper/interface/serviceOffered.mapper.interface";
import { ServiceOffered, SubService } from "@core/entities/implementation/service.entity";
import { IService } from "@core/entities/interfaces/service.entity.interface";
import { ServiceDocument } from "@core/schema/service.schema";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ServiceOfferedMapper implements IServiceOfferedMapper {
    toEntity(doc: ServiceDocument): IService {
        return new ServiceOffered({
            id: doc.id,
            title: doc.title,
            desc: doc.desc,
            image: doc.image,
            subService: doc.subService.map(service => new SubService({
                id: service.id,
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
}