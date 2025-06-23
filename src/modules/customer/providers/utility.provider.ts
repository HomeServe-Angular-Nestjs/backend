import { Provider } from "@nestjs/common";
import { ARGON_UTILITY_NAME, FAST2SMS_UTILITY_NAME } from "../../../core/constants/utility.constant";
import { Fast2SmsService } from "../../../core/utilities/implementations/fast2sms.utility";
import { ArgonUtility } from "src/core/utilities/implementations/argon.utility";

export const customerUtilityProviders: Provider[] = [
    {
        provide: FAST2SMS_UTILITY_NAME,
        useClass: Fast2SmsService
    },
    {
        provide: ARGON_UTILITY_NAME,
        useClass: ArgonUtility
    }
]