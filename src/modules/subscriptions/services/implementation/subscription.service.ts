import { Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ISubscriptionService } from "../interface/subscription-service.interface";
import { ISubscription } from "src/core/entities/interfaces/subscription.entity.interface";
import { IResponse } from "src/core/misc/response.util";
import { CreateSubscriptionDto } from "../../dto/subscription.dto";
import { PLAN_REPOSITORY_INTERFACE_NAME, SUBSCRIPTION_REPOSITORY_NAME } from "src/core/constants/repository.constant";
import { ISubscriptionRepository } from "src/core/repositories/interfaces/subscription-repo.interface";
import { IPlanRepository } from "src/core/repositories/interfaces/plans-repo.interface";
import { ErrorMessage } from "src/core/enum/error.enum";

@Injectable()
export class SubscriptionService implements ISubscriptionService {
    constructor(
        @Inject(SUBSCRIPTION_REPOSITORY_NAME)
        private readonly _subscriptionRepository: ISubscriptionRepository,
        @Inject(PLAN_REPOSITORY_INTERFACE_NAME)
        private readonly _planRepository: IPlanRepository
    ) { }

    async createSubscription(userId: string, dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>> {
        const plan = await this._planRepository.findById(dto.planId);
        if (!plan) {
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        const newSubscription = await this._subscriptionRepository.create({
            userId,
            planId: dto.planId,
            transactionId: dto.transactionId,
            name: plan.name,
            role: plan.role,
            duration: dto.duration,
            features: dto.features,
            startTime: dto.startTime,
            endDate: dto.endDate,
            isActive: true,
            isDeleted: false,
            paymentStatus: dto.paymentStatus,
        });

        if (!newSubscription) {
            throw new InternalServerErrorException(ErrorMessage.DOCUMENT_CREATION_ERROR);
        }

        return {
            success: true,
            message: 'Subscription created successfully.',
            data: newSubscription
        }
    }
}