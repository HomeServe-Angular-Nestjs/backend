import { Provider } from "@nestjs/common";
import { ARGON_UTILITY_NAME, MAILER_UTILITY_INTERFACE_NAME, TOKEN_UTILITY_NAME } from "../constants/utility.constant";
import { ArgonUtility } from "../common/utilities/implementations/argon.utility";
import { MailerUtility } from "../common/utilities/implementations/mailer.utility";
import { TokenUtility } from "../common/utilities/implementations/token.utility";

export const utilityProvider: Provider[] = [
    {
        provide: ARGON_UTILITY_NAME,
        useClass: ArgonUtility
    },
    {
        provide: MAILER_UTILITY_INTERFACE_NAME,
        useClass: MailerUtility
    },
    {
        provide: TOKEN_UTILITY_NAME,
        useClass: TokenUtility
    }
]