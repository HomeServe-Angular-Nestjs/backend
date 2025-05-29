import { Provider } from "@nestjs/common";
import { FAST2SMS_UTILITY_NAME } from "../../../core/constants/utility.constant";
import { Fast2SmsService } from "../../../core/utilities/implementations/fast2sms.utility";

export const customerUtilityProviders: Provider[] = [
    {
        provide: FAST2SMS_UTILITY_NAME,
        useClass: Fast2SmsService
    }
]