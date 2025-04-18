import { Provider } from '../../entities/implementation/provider.entity';
import { IBaseRepository } from '../base/interfaces/base-repo.interface';
import { ProviderDocument } from '../../schema/provider.schema';
import { IService } from '../../entities/interfaces/service.entity.interface';

export interface IProviderRepository
  extends IBaseRepository<Provider, ProviderDocument> {
  findByGoogleId(id: string): Promise<Provider | null>;
  fetchOfferedServices(id: string): Promise<IService[] | null>;
}
