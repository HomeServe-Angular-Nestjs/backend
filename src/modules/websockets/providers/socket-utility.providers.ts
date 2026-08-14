import { UPLOAD_UTILITY_NAME } from '@/core/constants/utility.constant';
import { CUSTOM_DTO_VALIDATOR_NAME } from '@/core/constants/utility.constant';
import { CustomDtoValidatorUtility } from '@/core/utilities/implementations/custom-dto-validator.utility';
import { UploadsUtility } from '@/core/utilities/implementations/upload.utility';
import type { Provider } from '@nestjs/common';

export const socketUtilityProviders: Provider[] = [
  {
    provide: CUSTOM_DTO_VALIDATOR_NAME,
    useClass: CustomDtoValidatorUtility,
  },
  {
    provide: UPLOAD_UTILITY_NAME,
    useClass: UploadsUtility,
  },
];
