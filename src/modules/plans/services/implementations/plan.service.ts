import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { PLAN_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';
import { IPlan } from '@core/entities/interfaces/plans.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { IResponse } from '@core/misc/response.util';
import { IPlanRepository } from '@core/repositories/interfaces/plans-repo.interface';
import { GetOnePlanDto, SavePlanDto, UpdatePlanDto, UpdatePlanStatusDto } from '@modules/plans/dto/plans.dto';
import { IPlanService } from '@modules/plans/services/interfaces/plan-service.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { PLAN_MAPPER } from '@core/constants/mappers.constant';
import { IPlanMapper } from '@core/dto-mapper/interface/plan.mapper.interface';

@Injectable()
export class PlanService implements IPlanService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(PLAN_REPOSITORY_INTERFACE_NAME)
        private readonly _planRepository: IPlanRepository,
        @Inject(PLAN_MAPPER)
        private readonly _planMapper: IPlanMapper
    ) {
        this.logger = this.loggerFactory.createLogger(PlanService.name);
    }

    async fetchPlans(): Promise<IResponse<IPlan[]>> {
        const plans = await this._planRepository.find({ isDeleted: false }, { sort: { createdAt: - 1 } });

        return {
            success: true,
            message: 'plans fetched successfully.',
            data: (plans || []).map(plan => this._planMapper.toEntity(plan))
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
            data: this._planMapper.toEntity(plan)
        }
    }

    async updateStatus(dto: UpdatePlanStatusDto): Promise<IResponse<IPlan>> {
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
            data: this._planMapper.toEntity(updatedPlan)
        }
    }
}
