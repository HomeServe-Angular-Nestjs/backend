import { Provider } from '@nestjs/common';
import {
  ARGON_UTILITY_NAME,
  MAILER_UTILITY_INTERFACE_NAME,
  TOKEN_UTILITY_NAME,
} from '../../../core/constants/utility.constant';
import { ArgonUtility } from '../../../core/utilities/implementations/argon.utility';
import { MailerUtility } from '../../../core/utilities/implementations/mailer.utility';
import { TokenUtility } from '../../../core/utilities/implementations/token.utility';

export const utilityProvider: Provider[] = [
  {
    provide: ARGON_UTILITY_NAME,
    useClass: ArgonUtility,
  },
  {
    provide: MAILER_UTILITY_INTERFACE_NAME,
    useClass: MailerUtility,
  },
  {
    provide: TOKEN_UTILITY_NAME,
    useClass: TokenUtility,
  },
];
