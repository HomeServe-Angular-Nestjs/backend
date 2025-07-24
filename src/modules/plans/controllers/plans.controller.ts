import { BadRequestException, Body, Controller, Delete, Get, Inject, InternalServerErrorException, Logger, Patch, Post, Put, Query, Req, UnauthorizedException } from "@nestjs/common";
import { PLAN_SERVICE_NAME } from "src/core/constants/service.constant";
import { IPlanService } from "../services/interfaces/plan-service.interface";
import { Request } from "express";
import { ErrorMessage } from "src/core/enum/error.enum";
import { SavePlanDto, GetOnePlanDto, UpdatePlanStatusDto, UpdatePlanDto } from "../dto/plans.dto";
import { IResponse } from "src/core/misc/response.util";
import { IPlan } from "src/core/entities/interfaces/plans.entity.interface";
import { CustomLogger } from "src/core/logger/custom-logger";

@Controller('plans')
export class PlanController {
    private readonly logger = new CustomLogger(PlanController.name);

    constructor(
        @Inject(PLAN_SERVICE_NAME)
        private readonly _planService: IPlanService
    ) { }

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

    @Post('')
    async createPlan(@Body() dto: SavePlanDto): Promise<IResponse<IPlan>> {
        try {
            return await this._planService.createPlan(dto);
        } catch (err) {
            this.logger.error('Error caught while creating plans: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR, err.message);
        }
    }

    @Put('')
    async updatePlan(@Body() dto: UpdatePlanDto): Promise<IResponse<IPlan>> {
        try {
            const { id, ...data } = dto;
            return await this._planService.updatePlan(id, data);
        } catch (err) {
            this.logger.error('Error caught while creating plans: ', err.message, err.stack);
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

    @Patch('')
    async deletePlan(@Body() dto: GetOnePlanDto): Promise<IResponse> {
        try {
            return await this._planService.deletePlan(dto.planId);
        } catch (err) {
            this.logger.error('Error caught while deleting plan: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

}
