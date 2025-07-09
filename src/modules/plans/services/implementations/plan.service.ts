import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { IPlanService } from "../interfaces/plan-service.interface";
import { IResponse } from "src/core/misc/response.util";
import { PLAN_REPOSITORY_INTERFACE_NAME } from "src/core/constants/repository.constant";
import { IPlanRepository } from "src/core/repositories/interfaces/plans-repo.interface";
import { CreatePlanDto, UpdatePlanStatusDto } from "../../dtos/plans.dto";
import { ErrorMessage } from "src/core/enum/error.enum";

@Injectable()
export class PlanService implements IPlanService {
    private readonly logger = new Logger(PlanService.name);

    constructor(
        @Inject(PLAN_REPOSITORY_INTERFACE_NAME)
        private readonly _planRepository: IPlanRepository
    ) { }

    async fetchPlans(): Promise<IResponse> {
        const plans = await this._planRepository.find({}, { sort: { createdAt: - 1 } });

        return {
            success: true,
            message: 'plans fetched successfully.',
            data: plans || []
        }
    }

    async createPlan(plan: CreatePlanDto): Promise<IResponse> {
        const newPlan = await this._planRepository.create({
            name: plan.name,
            price: plan.price,
            role: plan.role,
            features: plan.features,
            duration: plan.duration,
            isActive: true,
            isDeleted: false
        });

        return {
            success: !!newPlan,
            message: !!newPlan ? 'Plan created successfully' : 'Failed to create plan',
        }
    }

    async updateStatus(dto: UpdatePlanStatusDto): Promise<IResponse> {
        const updatedPlan = await this._planRepository.findOneAndUpdate(
            { _id: dto.id },
            { $set: { isActive: !dto.status } },
            { new: true }
        );  

        if (!updatedPlan) {
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        return {
            success: !!updatedPlan,
            message: !!updatedPlan ? 'Updated successfully.' : 'Failed to update.',
            data: updatedPlan
        }
    }
}