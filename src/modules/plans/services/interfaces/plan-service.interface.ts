import { IPlan } from '@core/entities/interfaces/plans.entity.interface';
import { IResponse } from '@core/misc/response.util';
import { GetOnePlanDto, UpdatePlanStatusDto } from '@modules/plans/dto/plans.dto';

export interface IPlanService {
    fetchPlans(): Promise<IResponse<IPlan[]>>;
    fetchOnePlan(dto: GetOnePlanDto): Promise<IResponse<IPlan>>
    updateStatus(dto: UpdatePlanStatusDto): Promise<IResponse>;
}