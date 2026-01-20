import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { IResponse } from '@core/misc/response.util';
import { PLAN_SERVICE_NAME } from '@core/constants/service.constant';
import { IPlan } from '@core/entities/interfaces/plans.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { GetOnePlanDto, SavePlanDto, UpdatePlanDto, UpdatePlanStatusDto } from '@modules/plans/dto/plans.dto';
import { IPlanService } from '@modules/plans/services/interfaces/plan-service.interface';
import { isValidIdPipe } from '@core/pipes/is-valid-id.pipe';

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
        return await this._planService.fetchPlans();
    }

    @Post('save')
    async savePlan(@Body() savePlanDto: SavePlanDto): Promise<IResponse<IPlan>> {
        return await this._planService.createPlan(savePlanDto);
    }

    @Get('one')
    async getOnePlan(@Query() getPlanDto: GetOnePlanDto): Promise<IResponse<IPlan>> {
        return await this._planService.fetchOnePlan(getPlanDto);
    }

    @Patch('status')
    async updatePlanStatus(@Body() updatePlanDto: UpdatePlanStatusDto): Promise<IResponse<IPlan>> {
        return await this._planService.updateStatus(updatePlanDto);
    }

    @Put('update')
    async updatePlan(@Body() updatePlanDto: UpdatePlanDto): Promise<IResponse<IPlan>> {
        return await this._planService.updatePlan(updatePlanDto);
    }

    @Delete('remove/:id')
    async deletePlan(@Param('id', new isValidIdPipe()) planId: string): Promise<IResponse<IPlan>> {
        return await this._planService.deletePlan(planId);
    }
}
