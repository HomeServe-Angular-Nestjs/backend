import { BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, Logger, Patch, Post, Put, Query, Req, UnauthorizedException } from "@nestjs/common";
import { PLAN_SERVICE_NAME } from "src/core/constants/service.constant";
import { IPlanService } from "../services/interfaces/plan-service.interface";
import { Request } from "express";
import { ErrorMessage } from "src/core/enum/error.enum";
import { CreatePlanDto, UpdatePlanStatusDto } from "../dtos/plans.dto";

@Controller('plans')
export class PlanController {
    private readonly logger = new Logger(PlanController.name);

    constructor(
        @Inject(PLAN_SERVICE_NAME)
        private readonly _planService: IPlanService
    ) { }

    @Get('')
    async getPlans(@Req() req: Request) {
        try {
            return await this._planService.fetchPlans();
        } catch (err) {
            this.logger.error('Error caught while fetching plans: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('')
    async createPlan(@Body() dto: CreatePlanDto) {
        try {
            return await this._planService.createPlan(dto);
        } catch (err) {
            this.logger.error('Error caught while creating plans: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('status')
    async updatePlanStatus(@Body() dto: UpdatePlanStatusDto) {
        try {
            return await this._planService.updateStatus(dto);
        } catch (err) {
            this.logger.error('Error caught while updating plan status: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

}