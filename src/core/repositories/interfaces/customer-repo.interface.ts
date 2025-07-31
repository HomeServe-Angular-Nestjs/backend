import { FilterQuery } from 'mongoose';

import { IReportUserData, IReportDownloadUserData, IStats } from '@core/entities/interfaces/admin.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { CustomerDocument } from '@core/schema/customer.schema';

export interface ICustomerRepository extends IBaseRepository<CustomerDocument> {
  findByGoogleId(id: string): Promise<CustomerDocument | null>;
  findByEmail(email: string): Promise<CustomerDocument | null>;
  count(filter?: FilterQuery<CustomerDocument>): Promise<number>;
  getCustomerStatistics(): Promise<IStats>;
  generateCustomersReport(data: Partial<IReportDownloadUserData>): Promise<IReportUserData[]>;
}
