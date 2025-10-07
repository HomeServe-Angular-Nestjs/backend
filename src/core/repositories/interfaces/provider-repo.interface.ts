import { FilterQuery } from 'mongoose';

import { IReportDownloadUserData, IReportProviderData, IStats } from '@core/entities/interfaces/admin.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { ProviderDocument } from '@core/schema/provider.schema';

export interface IProviderRepository extends IBaseRepository<ProviderDocument> {
  findByGoogleId(id: string): Promise<ProviderDocument | null>;
  updateGoogleId(email: string, googleId: string): Promise<ProviderDocument | null>;
  findByEmail(email: string): Promise<ProviderDocument | null>;
  updatePassword(email: string, hashedPassword: string): Promise<ProviderDocument | null>;
  count(filter?: FilterQuery<ProviderDocument>): Promise<number>;
  isExists(filter: FilterQuery<ProviderDocument>): Promise<boolean>;
  updateLastLogin(email: string): Promise<void>;
  // getCurrentRatingCountAndAverage(providerId: string): Promise<{ currentRatingCount: number, currentRatingAvg: number } | null>
  getProvidersBasedOnLocation(lng: number, lat: number): Promise<ProviderDocument[]>;
  addWorkImage(providerId: string, publicId: string): Promise<ProviderDocument | null>;
  getWorkImages(providerId: string): Promise<string[]>;
  getProviderStatistics(): Promise<IStats>;
  generateProviderReport(data: Partial<IReportDownloadUserData>): Promise<IReportProviderData[]>;
  updateSubscriptionId(providerId: string, subscriptionId: string): Promise<boolean>;
}