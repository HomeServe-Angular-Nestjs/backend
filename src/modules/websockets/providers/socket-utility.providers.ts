import { CUSTOM_DTO_VALIDATOR_NAME } from '@/core/constants/utility.constant';
import {
    CustomDtoValidatorUtility
} from '@/core/utilities/implementations/custom-dto-validator.utility';
import { Provider } from '@nestjs/common';

export const socketUtilityProviders: Provider[] = [
    {
        provide: CUSTOM_DTO_VALIDATOR_NAME,
        useClass: CustomDtoValidatorUtility
    }
]