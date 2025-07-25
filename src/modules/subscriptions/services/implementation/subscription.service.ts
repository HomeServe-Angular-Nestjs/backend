import {
    PLAN_REPOSITORY_INTERFACE_NAME, SUBSCRIPTION_REPOSITORY_NAME
} from '@/core/constants/repository.constant';
import { ISubscription } from '@/core/entities/interfaces/subscription.entity.interface';
import { ErrorMessage } from '@/core/enum/error.enum';
import { CustomLogger } from '@/core/logger/implementation/custom-logger';
import { IResponse } from '@/core/misc/response.util';
import { IPlanRepository } from '@/core/repositories/interfaces/plans-repo.interface';
import {
    ISubscriptionRepository
} from '@/core/repositories/interfaces/subscription-repo.interface';
import { CreateSubscriptionDto } from '@modules/subscriptions/dto/subscription.dto';
import {
    ISubscriptionService
} from '@modules/subscriptions/services/interface/subscription-service.interface';
import {
    ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException
} from '@nestjs/common';

@Injectable()
export class SubscriptionService implements ISubscriptionService {
    private logger = new CustomLogger(SubscriptionService.name);
    constructor(
        @Inject(SUBSCRIPTION_REPOSITORY_NAME)
        private readonly _subscriptionRepository: ISubscriptionRepository,
        @Inject(PLAN_REPOSITORY_INTERFACE_NAME)
        private readonly _planRepository: IPlanRepository
    ) { }

    async createSubscription(userId: string, dto: CreateSubscriptionDto): Promise<IResponse<ISubscription>> {
        const isSubscriptionExists = await this._subscriptionRepository.findOne({ userId });
        if (isSubscriptionExists) {
            throw new ConflictException(ErrorMessage.DOCUMENT_ALREADY_EXISTS);
        }

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

    async fetchSubscription(userId: string): Promise<IResponse<ISubscription | null>> {
        const subscription = await this._subscriptionRepository.findOne({ userId });

        return {
            success: true,
            message: 'Subscription fetched successfully',
            data: subscription
        }
    }
}
