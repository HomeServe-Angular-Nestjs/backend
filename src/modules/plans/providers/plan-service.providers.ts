import { Provider } from "@nestjs/common";
import { PlanService } from "../services/implementations/plan.service";
import { PLAN_SERVICE_NAME } from "src/core/constants/service.constant";

export const planServiceProviders: Provider[] = [
    {
        provide: PLAN_SERVICE_NAME,
        useClass: PlanService
    }
];