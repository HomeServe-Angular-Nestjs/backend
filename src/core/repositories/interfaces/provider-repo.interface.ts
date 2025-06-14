import { IBaseRepository } from '../base/interfaces/base-repo.interface';
import { ProviderDocument } from '../../schema/provider.schema';
import { FilterQuery } from 'mongoose';
import { IProvider } from 'src/core/entities/interfaces/user.entity.interface';

export interface IProviderRepository
  extends IBaseRepository<IProvider, ProviderDocument> {
  findByGoogleId(id: string): Promise<IProvider | null>;
  findByEmail(email: string): Promise<IProvider | null>;
  count(filter?: FilterQuery<ProviderDocument>): Promise<number>;
  isExists(filter: FilterQuery<ProviderDocument>): Promise<boolean>


}
