import { Module } from "@nestjs/common";
import { PlanController } from "./controllers/plans.controller";
import { planServiceProviders } from "./providers/plan-service.providers";
import { planRepositoryProvider } from "./providers/plan-repo.provider";

@Module({
    imports: [],
    controllers: [PlanController],
    providers: [
        ...planServiceProviders,
        ...planRepositoryProvider
    ]
})
export class PlanModule { }