import { LANDING_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { LANDING_SERVICE_NAME } from '@core/constants/service.constant';
import { UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { UploadsUtility } from '@core/utilities/implementations/upload.utility';
import { LandingRepository } from '@modules/landing/repositories/implementations/landing.repository';
import { LandingService } from '@modules/landing/services/implementations/landing.service';
import { Provider } from '@nestjs/common';

export const landingProviders: Provider[] = [
    {
        provide: LANDING_REPOSITORY_NAME,
        useClass: LandingRepository,
    },
    {
        provide: LANDING_SERVICE_NAME,
        useClass: LandingService,
    },
    {
        provide: UPLOAD_UTILITY_NAME,
        useClass: UploadsUtility,
    },
];