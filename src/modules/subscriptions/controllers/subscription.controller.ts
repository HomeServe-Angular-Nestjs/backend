import { Body, Controller, Get, Inject, Param, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { SUBSCRIPTION_SERVICE_NAME } from '@core/constants/service.constant';
import { ISubscription } from '@core/entities/interfaces/subscription.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IPayload } from '@core/misc/payload.interface';
import { IResponse } from '@core/misc/response.util';
import { ISubscriptionService } from '@modules/subscriptions/services/interface/subscription-service.interface';
import { CreateSubscriptionDto, IUpdatePaymentStatusDto, } from '../dto/subscription.dto';
import { PlanRoleEnum } from '@core/enum/subscription.enum';

@Controller('subscription')
export class SubscriptionController {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(SUBSCRIPTION_SERVICE_NAME)
        private readonly _subscriptionService: ISubscriptionService
    ) {
        this.logger = this._loggerFactory.createLogger(SubscriptionController.name);
    }

    @Post('')
    async createSubscription(@Req() req: Request, @Body() dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>> {
        const user = req.user as IPayload;
        return await this._subscriptionService.createSubscription(user.sub, user.type, dto);
    }

    @Get('')
    async fetchSubscription(@Req() req: Request) {
        const user = req.user as IPayload;
        return await this._subscriptionService.fetchSubscription(user.sub, user.type as PlanRoleEnum);
    }

    @Get('upgrade_amount/:subscriptionId')
    async getUpgradeAmount(@Req() req: Request, @Param('subscriptionId') subscriptionId: string): Promise<IResponse<number>> {
        const user = req.user as IPayload;
        return await this._subscriptionService.getUpgradeAmount(user.type, subscriptionId);
    }

    @Post('upgrade')
    async upgradeSubscription(@Req() req: Request, @Body() dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>> {
        const user = req.user as IPayload;
        return await this._subscriptionService.upgradeSubscription(user.sub, user.type, dto);
    }

    @Patch('payment_status')
    async updatePaymentStatus(@Req() req: Request, @Body() dto: IUpdatePaymentStatusDto): Promise<IResponse> {
        const user = req.user as IPayload;
        return await this._subscriptionService.updatePaymentStatus(user.sub, user.type, dto);
    }
}
