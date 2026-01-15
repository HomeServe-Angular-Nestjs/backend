import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SUBSCRIPTION_SERVICE_NAME } from '@core/constants/service.constant';
import { IAdminFilteredSubscriptionListWithPagination, ISubscription, ISubscriptionFilters } from '@core/entities/interfaces/subscription.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IPayload } from '@core/misc/payload.interface';
import { IResponse } from '@core/misc/response.util';
import { ISubscriptionService } from '@modules/subscriptions/services/interface/subscription-service.interface';
import { PlanRoleEnum } from '@core/enum/subscription.enum';
import { isValidIdPipe } from '@core/pipes/is-valid-id.pipe';
import { CreateSubscriptionDto, SubscriptionFiltersDto, UpdatePaymentStatusDto, UpdateSubscriptionStatusDto } from '@modules/subscriptions/dto/subscription.dto';
import { User } from '@core/decorators/extract-user.decorator';
import { OngoingPaymentGuard } from '@core/guards/ongoing-payment.guard';

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

    @UseGuards(OngoingPaymentGuard)
    @Post('')
    async createSubscription(@User() user: IPayload, @Body() createSubscriptionDto: CreateSubscriptionDto): Promise<IResponse<ISubscription>> {
        return await this._subscriptionService.createSubscription(user.sub, user.type, createSubscriptionDto);
    }

    @Get('')
    async fetchSubscription(@User() user: IPayload) {
        return await this._subscriptionService.fetchSubscription(user.sub, user.type as PlanRoleEnum);
    }

    @Get('lists')
    async fetchSubscriptionList(@Query() query: SubscriptionFiltersDto): Promise<IResponse<IAdminFilteredSubscriptionListWithPagination>> {
        console.log(query);
        return await this._subscriptionService.fetchSubscriptionList(query);
    }

    @Get('has_active_subscription')
    async hasActiveSubscription(@User() user: IPayload): Promise<IResponse> {
        return await this._subscriptionService.hasActiveSubscription(user.sub, user.type as PlanRoleEnum);
    }

    @Get('upgrade_amount/:subscriptionId')
    async getUpgradeAmount(@User() user: IPayload, @Param('subscriptionId') subscriptionId: string): Promise<IResponse<number>> {
        return await this._subscriptionService.getUpgradeAmount(user.type, subscriptionId);
    }

    @UseGuards(OngoingPaymentGuard)
    @Post('upgrade')
    async upgradeSubscription(@User() user: IPayload, @Body() createSubscriptionDto: CreateSubscriptionDto): Promise<IResponse<ISubscription>> {
        return await this._subscriptionService.upgradeSubscription(user.sub, user.type, createSubscriptionDto);
    }

    @Patch('status/:subscriptionId')
    async updateSubscriptionStatus(@Param('subscriptionId', new isValidIdPipe()) subscriptionId: string, @Body() updateSubscriptionStatusDto: UpdateSubscriptionStatusDto): Promise<IResponse> {
        return await this._subscriptionService.updateSubscriptionStatus(subscriptionId, updateSubscriptionStatusDto.status);
    }

    @Patch('payment_status')
    async updatePaymentStatus(@User() user: IPayload, @Body() updatePaymentStatusDto: UpdatePaymentStatusDto): Promise<IResponse> {
        return await this._subscriptionService.updatePaymentStatus(user.sub, user.type, updatePaymentStatusDto);
    }

    @Delete(':subscriptionId')
    async removeSubscription(@Param('subscriptionId', new isValidIdPipe()) subscriptionId: string): Promise<IResponse> {
        return await this._subscriptionService.removeSubscription(subscriptionId);

    }
}
