import type { IProvider } from '@core/entities/interfaces/user.entity.interface';
import type { ProviderDocument } from '@core/schema/provider.schema';

export interface IProviderMapper {
  toEntity(doc: ProviderDocument): IProvider;
  toDocument(entity: Partial<IProvider>): Partial<ProviderDocument>;
}
