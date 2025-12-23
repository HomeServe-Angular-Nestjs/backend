import { DateOverrideDocument } from "@core/schema/date-overrides.schema";

export interface IDateOverridesRepository {
    fetchOverridesByProviderId(providerId: string): Promise<DateOverrideDocument[]>;
    createOverride(providerId: string, dateOverrideDto: Partial<DateOverrideDocument>): Promise<DateOverrideDocument>;
    deleteOneByProviderIdAndDate(providerId: string, date: Date): Promise<boolean>;
    isValidOverrideDate(providerId: string, date: Date): Promise<boolean>;
} 