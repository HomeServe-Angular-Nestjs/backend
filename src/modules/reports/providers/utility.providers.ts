import { UPLOAD_UTILITY_NAME } from "@core/constants/utility.constant";
import { UploadsUtility } from "@core/utilities/implementations/upload.utility";
import { Provider } from "@nestjs/common";

export const reportUtilityProviders: Provider[] = [
    {
        provide: UPLOAD_UTILITY_NAME,
        useClass: UploadsUtility
    }
];