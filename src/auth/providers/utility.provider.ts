import { Provider } from "@nestjs/common";
import { ARGON_UTILITY_NAME, MAILER_OTP_UTILITY_INTERFACE_NAME } from "../constants/utility.constant";
import { ArgonUtility } from "../common/utilities/implementations/argon.utility";
import { MailerOtpUtility } from "../common/utilities/implementations/mailer.utility";

export const utilityProvider: Provider[] = [
    {
        provide: ARGON_UTILITY_NAME,
        useClass: ArgonUtility
    },
    {
        provide: MAILER_OTP_UTILITY_INTERFACE_NAME,
        useClass: MailerOtpUtility
    }
]