import { IPlan } from '@core/entities/interfaces/plans.entity.interface';
import { IResponse } from '@core/misc/response.util';
import { GetOnePlanDto, SavePlanDto, UpdatePlanDto, UpdatePlanStatusDto } from '@modules/plans/dto/plans.dto';

export interface IPlanService {
    createPlan(createPlanDto: SavePlanDto): Promise<IResponse<IPlan>>;
    fetchPlans(): Promise<IResponse<IPlan[]>>;
    fetchOnePlan(getPlanDto: GetOnePlanDto): Promise<IResponse<IPlan>>
    updateStatus(updatePlan: UpdatePlanStatusDto): Promise<IResponse>;
    updatePlan(updatePlanData: UpdatePlanDto): Promise<IResponse<IPlan>>;
    deletePlan(planId: string): Promise<IResponse>;
}