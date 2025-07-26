import { IService } from "@core/entities/interfaces/service.entity.interface";
import { ServiceDocument } from "@core/schema/service.schema";

export interface IServiceOfferedMapper {
    toEntity(doc: ServiceDocument):IService
}