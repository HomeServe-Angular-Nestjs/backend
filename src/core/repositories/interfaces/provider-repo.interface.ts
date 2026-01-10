import { FilterQuery } from 'mongoose';

import { IReportDownloadUserData, IReportProviderData, IStats } from '@core/entities/interfaces/admin.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { ProviderDocument } from '@core/schema/provider.schema';
import { Availability, IFilterFetchProviders, IProvider } from '@core/entities/interfaces/user.entity.interface';

export interface IProviderRepository extends IBaseRepository<ProviderDocument> {
  findByGoogleId(id: string): Promise<ProviderDocument | null>;
  updateGoogleId(email: string, googleId: string): Promise<ProviderDocument | null>;
  findByEmail(email: string): Promise<ProviderDocument | null>;
  fetchProvidersByFilterWithPagination(filter: IFilterFetchProviders, options: { page: number, limit: number }): Promise<ProviderDocument[]>;
  updatePassword(email: string, hashedPassword: string): Promise<ProviderDocument | null>;
  count(filter?: FilterQuery<ProviderDocument>): Promise<number>;
  isExists(filter: FilterQuery<ProviderDocument>): Promise<boolean>;
  updateLastLogin(email: string): Promise<void>;
  getProvidersBasedOnLocation(lng: number, lat: number, options: { page: number, limit: number }): Promise<ProviderDocument[]>;
  addWorkImage(providerId: string, publicId: string): Promise<ProviderDocument | null>;
  getWorkImages(providerId: string): Promise<string[]>;
  getProviderStatistics(): Promise<IStats>;
  generateProviderReport(data: Partial<IReportDownloadUserData>): Promise<IReportProviderData[]>;
  updateSubscriptionId(providerId: string, subscriptionId: string): Promise<boolean>;
  updatePasswordById(providerId: string, password: string): Promise<boolean>;
  getWorkingHours(providerId: string): Promise<Availability | null>;
  updateBufferTime(providerId: string, bufferTime: number): Promise<ProviderDocument | null>;
  getBufferTime(providerId: string): Promise<number>;
}