import { ADMIN_SETTINGS_REPOSITORY_NAME, BOOKING_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { PRICING_UTILITY_NAME, SLOT_UTILITY_NAME, TIME_UTILITY_NAME, UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { IAdminSettingsRepository } from '@core/repositories/interfaces/admin-settings-repo.interface';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { PricingUtility } from '@core/utilities/implementations/pricing.utility';
import { SlotUtility } from '@core/utilities/implementations/slot.utility';
import { TimeUtility } from '@core/utilities/implementations/time.utility';
import { UploadsUtility } from '@core/utilities/implementations/upload.utility';
import { Provider } from '@nestjs/common';

export const bookingsUtilityProviders: Provider[] = [
    {
        provide: PRICING_UTILITY_NAME,
        useFactory: (adminSettingsRepository: IAdminSettingsRepository) =>
            new PricingUtility(adminSettingsRepository),
        inject: [ADMIN_SETTINGS_REPOSITORY_NAME]
    },
    {
        provide: SLOT_UTILITY_NAME,
        useFactory: (bookingRepository: IBookingRepository) =>
            new SlotUtility(bookingRepository),
        inject: [BOOKING_REPOSITORY_NAME]
    },
    {
        provide: TIME_UTILITY_NAME,
        useFactory: () => new TimeUtility()
    },
    {
        provide: UPLOAD_UTILITY_NAME,
        useClass: UploadsUtility,
    }
]