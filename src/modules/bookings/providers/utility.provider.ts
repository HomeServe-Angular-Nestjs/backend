
import { AppConfig } from '@configs/infra/implementation/app-config';
import { BOOKING_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { PRICING_UTILITY_NAME, SLOT_UTILITY_NAME, TIME_UTILITY_NAME } from '@core/constants/utility.constant';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { PricingUtility } from '@core/utilities/implementations/pricing.utility';
import { SlotUtility } from '@core/utilities/implementations/slot.utility';
import { TimeUtility } from '@core/utilities/implementations/time.utility';
import { Provider } from '@nestjs/common';

export const bookingsUtilityProviders: Provider[] = [
    {
        provide: PRICING_UTILITY_NAME,
        useFactory: () =>
            new PricingUtility({ taxRate: AppConfig.taxRate }),
    },
    {
        provide: SLOT_UTILITY_NAME,
        useFactory: (bookingRepository: IBookingRepository) =>
            new SlotUtility(bookingRepository),
        inject: [BOOKING_REPOSITORY_NAME]
    },
    {
        provide: TIME_UTILITY_NAME,
        useFactory: () =>
            new TimeUtility({ timeZone: AppConfig.timeZone })
    }
]