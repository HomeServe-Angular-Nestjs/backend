import { PLAN_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';
import { IPlan } from '@core/entities/interfaces/plans.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { IResponse } from '@core/misc/response.util';
import { IPlanRepository } from '@core/repositories/interfaces/plans-repo.interface';
import {
    GetOnePlanDto, SavePlanDto, UpdatePlanDto, UpdatePlanStatusDto
} from '@modules/plans/dto/plans.dto';
import { IPlanService } from '@modules/plans/services/interfaces/plan-service.interface';
import {
    ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException
} from '@nestjs/common';

@Injectable()
export class PlanService implements IPlanService {
    private readonly logger = new CustomLogger(PlanService.name);

    constructor(
        @Inject(PLAN_REPOSITORY_INTERFACE_NAME)
        private readonly _planRepository: IPlanRepository
    ) { }

    async fetchPlans(): Promise<IResponse<IPlan[]>> {
        const plans = await this._planRepository.find({ isDeleted: false }, { sort: { createdAt: - 1 } });

        return {
            success: true,
            message: 'plans fetched successfully.',
            data: plans || []
        }
    }

    async fetchOnePlan(dto: GetOnePlanDto): Promise<IResponse<IPlan>> {
        const plan = await this._planRepository.findOne({ _id: dto.planId, isDeleted: false });

        if (!plan) {
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        return {
            success: true,
            message: 'plan fetched successfully.',
            data: plan
        }
    }

    async createPlan(plan: SavePlanDto): Promise<IResponse<IPlan>> {
        try {
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
                success: true,
                message: 'Plan created successfully',
                data: newPlan
            };
        } catch (err) {
            if (err.code === 11000) {
                throw new ConflictException('A plan with the same name and role already exists.');
            }

            throw new InternalServerErrorException('Something went wrong while creating the plan.');
        }
    }


    async updatePlan(id: string, data: Omit<UpdatePlanDto, "id">): Promise<IResponse<IPlan>> {
        try {
            const updatedPlan = await this._planRepository.findOneAndUpdate(
                { _id: id },
                { $set: data },
                { new: true }
            );

            if (!updatedPlan) {
                throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
            }

            return {
                success: true,
                message: 'Plan updated successfully.',
                data: updatedPlan
            }

        } catch (err) {
            if (err.code === 11000) {
                throw new ConflictException('A plan with the same name and role already exists.');
            }

            throw new InternalServerErrorException('Something went wrong while creating the plan.');
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

    async deletePlan(planId: string): Promise<IResponse> {
        const deletedPlan = await this._planRepository.findOneAndUpdate(
            { _id: planId },
            { $set: { isDeleted: true } },
            { new: true }
        );

        if (!deletedPlan) {
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        return {
            success: !!deletedPlan,
            message: !!deletedPlan ? 'Plan deleted successfully.' : 'Plan failed to update.',
            data: deletedPlan
        }
    }
}
