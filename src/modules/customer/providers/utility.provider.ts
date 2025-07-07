import { Provider } from "@nestjs/common";
import { ARGON_UTILITY_NAME, UPLOAD_UTILITY_NAME } from "../../../core/constants/utility.constant";
import { ArgonUtility } from "src/core/utilities/implementations/argon.utility";
import { UploadsUtility } from "src/core/utilities/implementations/upload.utility";

export const customerUtilityProviders: Provider[] = [
    {
        provide: ARGON_UTILITY_NAME,
        useClass: ArgonUtility
    },
    {
        provide: UPLOAD_UTILITY_NAME,
        useClass: UploadsUtility
    }
]