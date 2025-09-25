import { PLAN_SERVICE_NAME } from '@core/constants/service.constant';
import { IPlan } from '@core/entities/interfaces/plans.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IResponse } from '@core/misc/response.util';
import { GetOnePlanDto, UpdatePlanStatusDto } from '@modules/plans/dto/plans.dto';
import { IPlanService } from '@modules/plans/services/interfaces/plan-service.interface';
import { Body, Controller, Get, Inject, InternalServerErrorException, Patch, Query } from '@nestjs/common';

@Controller('plans')
export class PlanController {
    private readonly logger: ICustomLogger

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(PLAN_SERVICE_NAME)
        private readonly _planService: IPlanService
    ) {
        this.logger = this._loggerFactory.createLogger(PlanController.name);
    }

    @Get('')
    async getPlans(): Promise<IResponse<IPlan[]>> {
        try {
            return await this._planService.fetchPlans();
        } catch (err) {
            this.logger.error('Error caught while fetching plans: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('one')
    async getOnePlan(@Query() dto: GetOnePlanDto): Promise<IResponse<IPlan>> {
        try {
            return await this._planService.fetchOnePlan(dto);
        } catch (err) {
            this.logger.error('Error caught while fetching one plan: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('status')
    async updatePlanStatus(@Body() dto: UpdatePlanStatusDto): Promise<IResponse<IPlan>> {
        try {
            return await this._planService.updateStatus(dto);
        } catch (err) {
            this.logger.error('Error caught while updating plan status: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }
}
