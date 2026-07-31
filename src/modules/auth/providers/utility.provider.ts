import { Provider } from '@nestjs/common';

import {
  ARGON_UTILITY_NAME,
  TOKEN_UTILITY_NAME,
} from '../../../core/constants/utility.constant';
import { ArgonUtility } from '../../../core/utilities/implementations/argon.utility';
import { TokenUtility } from '../../../core/utilities/implementations/token.utility';

export const utilityProvider: Provider[] = [
  {
    provide: ARGON_UTILITY_NAME,
    useClass: ArgonUtility,
  },
  {
    provide: TOKEN_UTILITY_NAME,
    useClass: TokenUtility,
  },
];
