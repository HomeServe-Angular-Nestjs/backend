import { ADMIN_SETTINGS_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { PRICING_UTILITY_NAME, UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import type { IAdminSettingsRepository } from '@core/repositories/interfaces/admin-settings-repo.interface';
import { PricingUtility } from '@core/utilities/implementations/pricing.utility';
import { UploadsUtility } from '@core/utilities/implementations/upload.utility';
import type { Provider } from '@nestjs/common';

export const reportUtilityProviders: Provider[] = [
  {
    provide: UPLOAD_UTILITY_NAME,
    useClass: UploadsUtility,
  },
  {
    provide: PRICING_UTILITY_NAME,
    useFactory: (adminSettingsRepository: IAdminSettingsRepository) => new PricingUtility(adminSettingsRepository),
    inject: [ADMIN_SETTINGS_REPOSITORY_NAME],
  },
];
