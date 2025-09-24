import { AdminSettingsDocument } from "@core/schema/admin-settings.schema";

export interface IAdminSettingsRepository {
    getSettings(): Promise<AdminSettingsDocument>;
    updateSettings(update: Partial<AdminSettingsDocument>): Promise<AdminSettingsDocument>;
    getTax(): Promise<number>;
    getCustomerCommission(): Promise<number>;
    getProviderCommission(): Promise<number>;
} 