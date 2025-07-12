import { Body, Controller, Inject, InternalServerErrorException, Logger, Post, Req, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { SUBSCRIPTION_SERVICE_NAME } from "src/core/constants/service.constant";
import { ErrorMessage } from "src/core/enum/error.enum";
import { ISubscriptionService } from "../services/interface/subscription-service.interface";
import { IPayload } from "src/core/misc/payload.interface";
import { CreateSubscriptionDto } from "../dto/subscription.dto";
import { IResponse } from "src/core/misc/response.util";
import { ISubscription } from "src/core/entities/interfaces/subscription.entity.interface";

@Controller('subscription')
export class SubscriptionController {
    private readonly logger = new Logger(SubscriptionController.name);

    constructor(
        @Inject(SUBSCRIPTION_SERVICE_NAME)
        private readonly _subscriptionService: ISubscriptionService
    ) { }

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
}