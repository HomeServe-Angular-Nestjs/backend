import { FilterQuery } from 'mongoose';

import { IStats } from '@core/entities/interfaces/admin.entity.interface';
import { CustomerDocument } from '@core/schema/customer.schema';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';

export interface ICustomerRepository extends IBaseRepository<CustomerDocument> {
  findByGoogleId(id: string): Promise<CustomerDocument | null>;
  findByEmail(email: string): Promise<CustomerDocument | null>;
  count(filter?: FilterQuery<CustomerDocument>): Promise<number>;
  getCustomerStatistics(): Promise<IStats>;
}
