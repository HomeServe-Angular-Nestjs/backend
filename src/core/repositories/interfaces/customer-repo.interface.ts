import type { FilterQuery } from 'mongoose';

import type { IReportUserData, IReportDownloadUserData, IStats } from '@core/entities/interfaces/admin.entity.interface';
import type { IUpdateProfileData } from '@core/entities/interfaces/user.entity.interface';
import type { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import type { CustomerDocument } from '@core/schema/customer.schema';

export interface ICustomerRepository extends IBaseRepository<CustomerDocument> {
  findByGoogleId(id: string): Promise<CustomerDocument | null>;
  findByEmail(email: string): Promise<CustomerDocument | null>;
  findByIds(ids: string[]): Promise<CustomerDocument[]>;
  updateGoogleId(email: string, googleId: string): Promise<CustomerDocument | null>;
  updatePassword(email: string, hashedPassword: string): Promise<CustomerDocument | null>;
  count(filter?: FilterQuery<CustomerDocument>): Promise<number>;
  updateLastLogin(email: string): Promise<void>;
  getCustomerStatistics(): Promise<IStats>;
  generateCustomersReport(data: Partial<IReportDownloadUserData>): Promise<IReportUserData[]>;
  changeReviewStatus(id: string, status: boolean): Promise<void>;
  updateSubscriptionId(customerId: string, subscriptionId: string): Promise<boolean>;
  partialUpdate(id: string, data: Record<string, unknown>): Promise<CustomerDocument | null>;
  toggleFavorite(customerId: string, providerId: string): Promise<CustomerDocument | null>;
  updatePasswordById(customerId: string, hashedPassword: string): Promise<CustomerDocument | null>;
  updateAvatar(customerId: string, publicId: string): Promise<CustomerDocument | null>;
  updateProfile(customerId: string, data: IUpdateProfileData): Promise<CustomerDocument | null>;
}
