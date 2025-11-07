import { Provider } from '@nestjs/common';

import { ARGON_UTILITY_NAME, UPLOAD_UTILITY_NAME } from '../../../core/constants/utility.constant';
import { UploadsUtility } from '../../../core/utilities/implementations/upload.utility';
import { ArgonUtility } from '@core/utilities/implementations/argon.utility';

export const utilityProviders: Provider[] = [
  {
    provide: UPLOAD_UTILITY_NAME,
    useClass: UploadsUtility,
  },
  {
    provide: ARGON_UTILITY_NAME,
    useClass: ArgonUtility,
  },
];
