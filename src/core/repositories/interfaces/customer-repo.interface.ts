import { IBaseRepository } from '../base/interfaces/base-repo.interface';
import { CustomerDocument } from '../../schema/customer.schema';
import { FilterQuery } from 'mongoose';
import { ICustomer } from 'src/core/entities/interfaces/user.entity.interface';
import { IAdminDashboardUserStats, IStats } from 'src/core/entities/interfaces/admin.entity.interface';

export interface ICustomerRepository
  extends IBaseRepository<ICustomer, CustomerDocument> {
  findByGoogleId(id: string): Promise<ICustomer | null>;
  findByEmail(email: string): Promise<ICustomer | null>;
  count(filter?: FilterQuery<CustomerDocument>): Promise<number>;
  getCustomerStatistics(): Promise<IStats>
}
