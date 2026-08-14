import type { IProviderService, IProviderServiceUI } from '@core/entities/interfaces/provider-service.entity.interface';
import type { ProviderServiceDocument, ProviderServicePopulatedDocument } from '@core/schema/provider-service.schema';

export interface IProviderServiceMapper {
  toDocument(entity: IProviderService): Partial<ProviderServiceDocument>;
  toEntity(doc: ProviderServiceDocument): IProviderService;
  toPopulatedEntity(doc: ProviderServicePopulatedDocument): IProviderServiceUI;
}
