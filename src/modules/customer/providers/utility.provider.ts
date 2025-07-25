import { ARGON_UTILITY_NAME, UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { ArgonUtility } from '@core/utilities/implementations/argon.utility';
import { UploadsUtility } from '@core/utilities/implementations/upload.utility';
import { Provider } from '@nestjs/common';

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