import { UPLOAD_UTILITY_NAME } from "@core/constants/utility.constant";
import { Provider } from "@nestjs/common";
import { UploadsUtility } from "@core/utilities/implementations/upload.utility";

export const cartUtilityProvider: Provider[] = [
    {
        provide: UPLOAD_UTILITY_NAME,
        useClass: UploadsUtility
    }
];