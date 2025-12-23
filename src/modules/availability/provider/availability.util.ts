import { TIME_UTILITY_NAME } from "@core/constants/utility.constant";
import { TimeUtility } from "@core/utilities/implementations/time.utility";
import { Provider } from "@nestjs/common";

export const availabilityUtilityProvider: Provider[] = [
    {
        provide: TIME_UTILITY_NAME,
        useClass: TimeUtility,
    }
]