import { IResponse } from "src/core/misc/response.util";
import { SavePlanDto, GetOnePlanDto, UpdatePlanStatusDto, UpdatePlanDto } from "../../dto/plans.dto";
import { IPlan } from "src/core/entities/interfaces/plans.entity.interface";

export interface IPlanService {
    fetchPlans(): Promise<IResponse<IPlan[]>>;
    fetchOnePlan(dto: GetOnePlanDto): Promise<IResponse<IPlan>>
    createPlan(plan: SavePlanDto): Promise<IResponse>;
    updatePlan(id: string, data: Omit<UpdatePlanDto, 'id'>): Promise<IResponse<IPlan>>;
    updateStatus(dto: UpdatePlanStatusDto): Promise<IResponse>;
    deletePlan(planId: string): Promise<IResponse>;
}