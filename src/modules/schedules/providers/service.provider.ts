import { SCHEDULES_SERVICE_NAME } from '@core/constants/service.constant';
import {
    SchedulesService
} from '@modules/schedules/services/implementations/provider-schedules.service';
import { Provider } from '@nestjs/common';

export const schedulesServiceProviders: Provider[] = [
    {
        provide: SCHEDULES_SERVICE_NAME,
        useClass: SchedulesService
    }
]