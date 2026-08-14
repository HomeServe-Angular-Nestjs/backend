import type { FilterQuery } from 'mongoose';

import type { IReportDownloadUserData, IReportProviderData, IStats } from '@core/entities/interfaces/admin.entity.interface';
import type { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import type { ProviderDocument } from '@core/schema/provider.schema';
import type { Availability, IFilterFetchProviders, VerificationStatusType } from '@core/entities/interfaces/user.entity.interface';

export interface IProviderRepository extends IBaseRepository<ProviderDocument> {
  findByGoogleId(id: string): Promise<ProviderDocument | null>;
  updateGoogleId(email: string, googleId: string): Promise<ProviderDocument | null>;
  findByEmail(email: string): Promise<ProviderDocument | null>;
  fetchProvidersByFilterWithPagination(
    filter: IFilterFetchProviders,
    options: { page: number; limit: number },
    searchRadiusMeters: number,
  ): Promise<ProviderDocument[]>;
  countProvidersByFilter(filter: IFilterFetchProviders, searchRadiusMeters: number): Promise<number>;
  updatePassword(email: string, hashedPassword: string): Promise<ProviderDocument | null>;
  count(filter?: FilterQuery<ProviderDocument>): Promise<number>;
  isExists(filter: FilterQuery<ProviderDocument>): Promise<boolean>;
  updateLastLogin(email: string): Promise<void>;
  addWorkImage(providerId: string, publicId: string): Promise<ProviderDocument | null>;
  getWorkImages(providerId: string): Promise<string[]>;
  getProviderStatistics(): Promise<IStats>;
  generateProviderReport(data: Partial<IReportDownloadUserData>): Promise<IReportProviderData[]>;
  updateSubscriptionId(providerId: string, subscriptionId: string): Promise<boolean>;
  updatePasswordById(providerId: string, password: string): Promise<boolean>;
  getWorkingHours(providerId: string): Promise<Availability | null>;
  updateBufferTime(providerId: string, bufferTime: number): Promise<ProviderDocument | null>;
  getBufferTime(providerId: string): Promise<number>;
  hasSubmittedDocuments(providerId: string): Promise<boolean>;
  updateVerificationStatus(providerId: string, status: VerificationStatusType): Promise<ProviderDocument | null>;
}
