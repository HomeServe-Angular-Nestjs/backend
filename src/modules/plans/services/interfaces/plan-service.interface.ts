import { IResponse } from "src/core/misc/response.util";
import { CreatePlanDto, UpdatePlanStatusDto } from "../../dtos/plans.dto";

export interface IPlanService {
    fetchPlans(): Promise<IResponse>;
    createPlan(plan: CreatePlanDto): Promise<IResponse>;
    updateStatus(dto: UpdatePlanStatusDto): Promise<IResponse>;
}