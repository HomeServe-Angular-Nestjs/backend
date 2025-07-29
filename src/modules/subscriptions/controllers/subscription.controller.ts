import { Request } from 'express';

import { SUBSCRIPTION_SERVICE_NAME } from '@core/constants/service.constant';
import { ISubscription } from '@core/entities/interfaces/subscription.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IPayload } from '@core/misc/payload.interface';
import { IResponse } from '@core/misc/response.util';
import {
    ISubscriptionService
} from '@modules/subscriptions/services/interface/subscription-service.interface';
import {
    Body, Controller, Get, Inject, InternalServerErrorException, Param, Post, Req,
    UnauthorizedException
} from '@nestjs/common';

import { CreateSubscriptionDto, } from '../dto/subscription.dto';

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
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._subscriptionService.createSubscription(user.sub, dto);
        } catch (err) {
            this.logger.error('Error caught while creating subscription: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('')
    async fetchSubscription(@Req() req: Request) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._subscriptionService.fetchSubscription(user.sub);
        } catch (err) {
            this.logger.error('Error caught while fetching the subscription: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('upgrade_amount/:subscriptionId')
    async getUpgradeAmount(@Req() req: Request, @Param('subscriptionId') subscriptionId: string): Promise<IResponse<number>> {
        try {
            const user = req.user as IPayload;
            if (!user.sub || !user.type) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._subscriptionService.getUpgradeAmount(user.type, subscriptionId);
        } catch (err) {
            this.logger.error('Error caught while upgrading the subscription: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('upgrade')
    async upgradeSubscription(@Req() req: Request, @Body() dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._subscriptionService.upgradeSubscription(user.sub, dto);
        } catch (err) {
            this.logger.error('Error caught while creating subscription: ', err.message, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }
}
