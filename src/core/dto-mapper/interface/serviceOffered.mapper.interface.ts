import type { IService } from '@core/entities/interfaces/service.entity.interface';
import type { ServiceDocument } from '@core/schema/service.schema';

export interface IServiceOfferedMapper {
  toEntity(doc: ServiceDocument): IService;
  toDocument(entity: Partial<IService>): Partial<ServiceDocument>;
}
