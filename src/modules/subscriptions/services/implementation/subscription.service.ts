import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { PLAN_REPOSITORY_INTERFACE_NAME, SUBSCRIPTION_REPOSITORY_NAME } from '@/core/constants/repository.constant';
import { ISubscription } from '@/core/entities/interfaces/subscription.entity.interface';
import { ErrorMessage } from '@/core/enum/error.enum';
import { IResponse } from '@/core/misc/response.util';
import { IPlanRepository } from '@/core/repositories/interfaces/plans-repo.interface';
import { ISubscriptionRepository } from '@/core/repositories/interfaces/subscription-repo.interface';
import { CreateSubscriptionDto } from '@modules/subscriptions/dto/subscription.dto';
import { ISubscriptionService } from '@modules/subscriptions/services/interface/subscription-service.interface';
import { SUBSCRIPTION_MAPPER } from '@core/constants/mappers.constant';
import { ISubscriptionMapper } from '@core/dto-mapper/interface/subscription.mapper.interface';

@Injectable()
export class SubscriptionService implements ISubscriptionService {

    constructor(
        @Inject(SUBSCRIPTION_REPOSITORY_NAME)
        private readonly _subscriptionRepository: ISubscriptionRepository,
        @Inject(PLAN_REPOSITORY_INTERFACE_NAME)
        private readonly _planRepository: IPlanRepository,
        @Inject(SUBSCRIPTION_MAPPER)
        private readonly _subscriptionMapper: ISubscriptionMapper
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
            role: dto.role,
            duration: dto.duration,
            features: dto.features,
            startTime: new Date(dto.startTime),
            endDate: dto.endDate ? new Date(dto.endDate) : null,
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
            data: this._subscriptionMapper.toEntity(newSubscription)
        }
    }

    async fetchSubscription(userId: string): Promise<IResponse<ISubscription | null>> {
        const subscription = await this._subscriptionRepository.findOne({ userId });

        if (!subscription) {
            return {
                success: false,
                message: 'Subscription fetched successfully',
                data: null
            }
        }

        return {
            success: true,
            message: 'Subscription fetched successfully',
            data: this._subscriptionMapper.toEntity(subscription)
        }
    }
}
