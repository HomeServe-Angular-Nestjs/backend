import { Provider } from "@nestjs/common";
import { CUSTOM_DTO_VALIDATOR_NAME } from "src/core/constants/utility.constant";
import { CustomDtoValidatorUtility } from "src/core/utilities/implementations/custom-dto-validator.utility";

export const socketUtilityProviders: Provider[] = [
    {
        provide: CUSTOM_DTO_VALIDATOR_NAME,
        useClass: CustomDtoValidatorUtility
    }
]