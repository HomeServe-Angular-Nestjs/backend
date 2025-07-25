import { Provider } from '@nestjs/common';

import { UPLOAD_UTILITY_NAME } from '../../../core/constants/utility.constant';
import { UploadsUtility } from '../../../core/utilities/implementations/upload.utility';

export const utilityProviders: Provider[] = [
  {
    provide: UPLOAD_UTILITY_NAME,
    useClass: UploadsUtility,
  },
];
