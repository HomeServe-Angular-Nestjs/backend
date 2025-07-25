import { PLAN_SERVICE_NAME } from '@core/constants/service.constant';
import { PlanService } from '@modules/plans/services/implementations/plan.service';
import { Provider } from '@nestjs/common';

export const planServiceProviders: Provider[] = [
    {
        provide: PLAN_SERVICE_NAME,
        useClass: PlanService
    }
];