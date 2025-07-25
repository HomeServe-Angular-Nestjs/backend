import { FilterQuery } from 'mongoose';

import { IStats } from '@core/entities/interfaces/admin.entity.interface';
import { ICustomer } from '@core/entities/interfaces/user.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { CustomerDocument } from '@core/schema/customer.schema';

export interface ICustomerRepository
  extends IBaseRepository<ICustomer, CustomerDocument> {
  findByGoogleId(id: string): Promise<ICustomer | null>;
  findByEmail(email: string): Promise<ICustomer | null>;
  count(filter?: FilterQuery<CustomerDocument>): Promise<number>;
  getCustomerStatistics(): Promise<IStats>
}
