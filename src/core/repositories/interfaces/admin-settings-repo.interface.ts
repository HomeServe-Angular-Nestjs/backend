import type { AdminSettingsDocument } from '@core/schema/admin-settings.schema';
import type { IBaseRepository } from '@core/repositories/base/interfaces/base-repo.interface';

export interface IAdminSettingsRepository extends IBaseRepository<AdminSettingsDocument> {
  getSettings(): Promise<AdminSettingsDocument>;
  updateSettings(update: Partial<AdminSettingsDocument>): Promise<AdminSettingsDocument>;
  getTax(): Promise<number>;
  getCustomerCommission(): Promise<number>;
  getProviderCommission(): Promise<number>;
  getDefaultServiceLimit(): Promise<number>;
}
