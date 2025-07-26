import { FilterQuery } from 'mongoose';

import { IStats } from '@core/entities/interfaces/admin.entity.interface';
import { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';
import { ProviderDocument } from '@core/schema/provider.schema';

export interface IProviderRepository extends IBaseRepository<ProviderDocument> {
  findByGoogleId(id: string): Promise<ProviderDocument | null>;
  findByEmail(email: string): Promise<ProviderDocument | null>;
  count(filter?: FilterQuery<ProviderDocument>): Promise<number>;
  isExists(filter: FilterQuery<ProviderDocument>): Promise<boolean>
  getCurrentRatingCountAndAverage(providerId: string): Promise<{ currentRatingCount: number, currentRatingAvg: number } | null>
  getProvidersBasedOnLocation(lng: number, lat: number): Promise<ProviderDocument[]>;
  addWorkImage(providerId: string, publicId: string): Promise<ProviderDocument | null>;
  getWorkImages(providerId: string): Promise<string[]>;
  getProviderStatistics(): Promise<IStats>;
}