import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PLAN_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';
import { IPlan, PlanFeatures } from '@core/entities/interfaces/plans.entity.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { IResponse } from '@core/misc/response.util';
import { IPlanRepository } from '@core/repositories/interfaces/plans-repo.interface';
import { GetOnePlanDto, SavePlanDto, UpdatePlanDto, UpdatePlanStatusDto } from '@modules/plans/dto/plans.dto';
import { IPlanService } from '@modules/plans/services/interfaces/plan-service.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { PLAN_MAPPER } from '@core/constants/mappers.constant';
import { IPlanMapper } from '@core/dto-mapper/interface/plan.mapper.interface';
import { FEATURE_REGISTRY } from '@modules/plans/registry/feature.registry';

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

    private _validateFeature(features: PlanFeatures): void {
        if (!features || typeof features !== 'object') {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Features must be an object'
            });
        }

        for (const [key, value] of Object.entries(features)) {
            const feature = Object.values(FEATURE_REGISTRY)
                .find(f => f.key === key);

            if (!feature) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: `Feature "${key}" is not allowed`
                });
            }

            switch (feature.type) {
                case 'boolean':
                    if (typeof value !== 'boolean') {
                        throw new BadRequestException({
                            code: ErrorCodes.BAD_REQUEST,
                            message: `"${key}" must be boolean`
                        });
                    }
                    break;

                case 'number':
                    if (typeof value !== 'number') {
                        throw new BadRequestException({
                            code: ErrorCodes.BAD_REQUEST,
                            message: `"${key}" must be number`
                        });
                    }
                    break;

                case 'enum':
                    if (!feature.values?.includes(value as string)) {
                        throw new BadRequestException({
                            code: ErrorCodes.BAD_REQUEST,
                            message: `"${key}" must be one of: ${feature.values?.join(', ')}`
                        });
                    }
                    break;
            }
        }
    }

    async createPlan(createPlanDto: SavePlanDto): Promise<IResponse<IPlan>> {
        this._validateFeature(createPlanDto.features);

        const isAlreadyExists = await this._planRepository.isPlanExists({
            name: createPlanDto.name,
            role: createPlanDto.role
        });

        if (isAlreadyExists) {
            throw new ConflictException({
                code: ErrorCodes.CONFLICT,
                message: ErrorMessage.PLAN_ALREADY_EXISTS
            });
        }

        const plan = this._planMapper.toDocument({
            name: createPlanDto.name,
            price: createPlanDto.price,
            duration: createPlanDto.duration,
            role: createPlanDto.role,
            features: createPlanDto.features,
            isActive: createPlanDto.isActive,
            isDeleted: false
        });

        let createdPlan: IPlan;
        try {
            const planDoc = await this._planRepository.create(plan);
            createdPlan = this._planMapper.toEntity(planDoc);
        } catch (error) {
            if (error.status === 11000) {
                throw new ConflictException({
                    code: ErrorCodes.CONFLICT,
                    message: ErrorMessage.PLAN_ALREADY_EXISTS
                });
            }

            throw error;
        }

        return {
            success: !!createdPlan,
            message: !!createdPlan ? 'Plan created successfully.' : 'Failed to create plan.',
            data: createdPlan
        }
    }

    async fetchPlans(): Promise<IResponse<IPlan[]>> {
        const plans = await this._planRepository.find({ isDeleted: false }, { sort: { price: 1 } });

        return {
            success: true,
            message: 'plans fetched successfully.',
            data: (plans || []).map(plan => this._planMapper.toEntity(plan))
        }
    }

    async fetchOnePlan(getPlanDto: GetOnePlanDto): Promise<IResponse<IPlan>> {
        const plan = await this._planRepository.findPlan(getPlanDto.planId);

        if (!plan) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: ErrorMessage.PLAN_UNAVAILABLE
            });
        }

        return {
            success: true,
            message: 'plan fetched successfully.',
            data: this._planMapper.toEntity(plan)
        }
    }

    async updateStatus(updatePlanDto: UpdatePlanStatusDto): Promise<IResponse<IPlan>> {
        const updatedPlan = await this._planRepository.updatePlanByPlanId(
            updatePlanDto.id,
            { isActive: !updatePlanDto.status },
            { new: true }
        );

        if (!updatedPlan) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: ErrorMessage.DOCUMENT_NOT_FOUND
            });
        }

        return {
            success: !!updatedPlan,
            message: !!updatedPlan ? 'Updated successfully.' : 'Failed to update.',
            data: this._planMapper.toEntity(updatedPlan)
        }
    }

    async updatePlan(updatePlanDto: UpdatePlanDto): Promise<IResponse<IPlan>> {
        const { id: planId, ...updatePlanData } = updatePlanDto;

        this._validateFeature(updatePlanData.features);

        const isAlreadyExists = await this._planRepository.isPlanExists({
            name: updatePlanData.name,
            role: updatePlanData.role
        });

        if (isAlreadyExists) {
            throw new ConflictException({
                code: ErrorCodes.CONFLICT,
                message: ErrorMessage.PLAN_ALREADY_EXISTS
            });
        }

        const updatedPlan = await this._planRepository.updatePlanByPlanId(
            planId,
            updatePlanData,
            { new: true }
        );

        if (!updatedPlan) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: ErrorMessage.PLAN_NOT_FOUND
            });
        }

        return {
            success: !!updatedPlan,
            message: !!updatedPlan ? 'Plan updated successfully.' : 'Failed to update plan.',
            data: this._planMapper.toEntity(updatedPlan)
        }
    }

    async deletePlan(planId: string): Promise<IResponse> {
        try {

            const deletedPlan = await this._planRepository.deletePlan(planId);

            if (!deletedPlan) {
                throw new NotFoundException({
                    code: ErrorCodes.NOT_FOUND,
                    message: ErrorMessage.PLAN_NOT_FOUND
                });
            }

            return {
                success: !!deletedPlan,
                message: !!deletedPlan ? 'Plan deleted successfully.' : 'Failed to delete plan.'
            }
        } catch (err) {
            if (err.code === 11000) {
                throw new ConflictException({
                    code: ErrorCodes.CONFLICT,
                    message: ErrorMessage.PLAN_ALREADY_EXISTS
                });
            }

            throw err;
        }
    }
}
