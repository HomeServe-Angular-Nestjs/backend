import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PLAN_MODEL_NAME } from "src/core/constants/model.constant";
import { PLAN_REPOSITORY_INTERFACE_NAME } from "src/core/constants/repository.constant";
import { PlanRepository } from "src/core/repositories/implementations/plan.repository";
import { PlanDocumentType } from "src/core/schema/plans.schema";

export const planRepositoryProvider: Provider[] = [
    {
        provide: PLAN_REPOSITORY_INTERFACE_NAME,
        useFactory: (planModel: Model<PlanDocumentType>) =>
            new PlanRepository(planModel),
        inject: [getModelToken(PLAN_MODEL_NAME)]
    }
];