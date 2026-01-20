import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PLAN_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SUBSCRIPTION_REPOSITORY_NAME } from '@/core/constants/repository.constant';
import { IAdminFilteredSubscriptionListWithPagination, IAdminSubscriptionList, ISubscription, ISubscriptionFilters, SubscriptionStatusType } from '@/core/entities/interfaces/subscription.entity.interface';
import { ErrorCodes, ErrorMessage } from '@/core/enum/error.enum';
import { IResponse } from '@/core/misc/response.util';
import { IPlanRepository } from '@/core/repositories/interfaces/plans-repo.interface';
import { ISubscriptionRepository } from '@/core/repositories/interfaces/subscription-repo.interface';
import { CreateSubscriptionDto, SubscriptionFiltersDto, UpdatePaymentStatusDto } from '@modules/subscriptions/dto/subscription.dto';
import { ISubscriptionService } from '@modules/subscriptions/services/interface/subscription-service.interface';
import { PLAN_MAPPER, SUBSCRIPTION_MAPPER } from '@core/constants/mappers.constant';
import { ISubscriptionMapper } from '@core/dto-mapper/interface/subscription.mapper.interface';
import { IPlanMapper } from '@core/dto-mapper/interface/plan.mapper.interface';
import { PlanDurationEnum, PlanRoleEnum } from '@core/enum/subscription.enum';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { ClientUserType, UserType } from '@core/entities/interfaces/user.entity.interface';
import { PaymentStatus } from '@core/enum/bookings.enum';
import { PAYMENT_LOCKING_UTILITY_NAME } from '@core/constants/utility.constant';
import { IPaymentLockingUtility } from '@core/utilities/interface/payment-locking.utility';

@Injectable()
export class SubscriptionService implements ISubscriptionService {

    constructor(
        @Inject(SUBSCRIPTION_REPOSITORY_NAME)
        private readonly _subscriptionRepository: ISubscriptionRepository,
        @Inject(PLAN_REPOSITORY_INTERFACE_NAME)
        private readonly _planRepository: IPlanRepository,
        @Inject(SUBSCRIPTION_MAPPER)
        private readonly _subscriptionMapper: ISubscriptionMapper,
        @Inject(PLAN_MAPPER)
        private readonly _planMapper: IPlanMapper,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(PAYMENT_LOCKING_UTILITY_NAME)
        private readonly _paymentLockingUtility: IPaymentLockingUtility,
    ) { }

    private async _isUpdatedUserSubscriptionStatus(userId: string, userType: string, subscriptionId: string): Promise<boolean> {
        let isUpdated: boolean = false;

        if (userType === 'customer') {
            isUpdated = await this._customerRepository.updateSubscriptionId(userId, subscriptionId);
        } else if (userType === 'provider') {
            isUpdated = await this._providerRepository.updateSubscriptionId(userId, subscriptionId);
        }

        return isUpdated;
    }

    private async _getUserEmailAndRole(userId: string, userType: ClientUserType): Promise<{ email: string; role: ClientUserType }> {
        let userDoc;

        if (userType === 'customer') {
            userDoc = await this._customerRepository.findById(userId);
        } else if (userType === 'provider') {
            userDoc = await this._providerRepository.findById(userId);
        }

        if (!userDoc) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: ErrorMessage.USER_NOT_FOUND,
            });
        }

        return { email: userDoc.email, role: userType };
    }

    private _calculateUpgradeAmount(monthlyPrice: number, yearlyPrice: number, startDateStr: string): number {
        const startDate = new Date(startDateStr);
        const today = new Date();

        // Normalizing time to prevent partial-day errors
        startDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const msInDay = 1000 * 60 * 60 * 24;
        const daysUsed = Math.floor((today.getTime() - startDate.getTime()) / msInDay);

        // within 7 days, subtract full monthly
        if (daysUsed < 7) {
            return yearlyPrice - monthlyPrice;
        }

        // after 7 days, subtract only unused portion
        const totalDaysInMonth = 30;
        const unusedDays = Math.max(totalDaysInMonth - daysUsed, 0);
        const perDayPrice = monthlyPrice / totalDaysInMonth;
        const creditAmount = unusedDays * perDayPrice;

        return Math.floor(yearlyPrice - creditAmount);
    }

    private _getSubscriptionEndDateAndStartDate(duration: PlanDurationEnum): { startTime: Date; endDate: Date } {
        const startTime = new Date();
        const endDate = new Date(startTime);

        switch (duration) {
            case PlanDurationEnum.Monthly:
                endDate.setMonth(endDate.getMonth() + 1);
                break;

            case PlanDurationEnum.Yearly:
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;

            default:
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Invalid subscription duration.',
                });
        }

        return { startTime, endDate };
    }

    private _getSubscriptionStatus(subscription: ISubscription): SubscriptionStatusType {
        const today = new Date();

        if (subscription.isActive) {
            return 'active';
        } else if (subscription.endDate < today) {
            return 'expired';
        } else {
            return 'inactive';
        }
    }

    async createSubscription(userId: string, userType: UserType, createSubscriptionDto: CreateSubscriptionDto): Promise<IResponse<ISubscription>> {
        const key = this._paymentLockingUtility.generatePaymentKey(userId, userType);

        const acquired = await this._paymentLockingUtility.acquireLock(key, 300);
        if (!acquired) {
            const ttl = await this._paymentLockingUtility.getTTL(key);

            throw new ConflictException({
                code: ErrorCodes.PAYMENT_IN_PROGRESS,
                message: `We are still processing your previous payment. Please try again in ${ttl} seconds.`,
                ttl
            });
        }

        try {
            const isSubscriptionExists = await this._subscriptionRepository.findActiveSubscriptionByUserId(userId, userType);

            if (isSubscriptionExists) {
                throw new ConflictException({
                    code: ErrorCodes.CONFLICT,
                    message: `Subscription ${ErrorMessage.DOCUMENT_ALREADY_EXISTS}`
                });
            }

            const planDoc = await this._planRepository.findById(createSubscriptionDto.planId);
            if (!planDoc) throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Failed to find the plan.'
            });

            const plan = this._planMapper.toEntity(planDoc);

            const { endDate, startTime } = this._getSubscriptionEndDateAndStartDate(plan.duration)

            const newSubscription = await this._subscriptionRepository.create(
                this._subscriptionMapper.toDocument({
                    userId,
                    planId: plan.id,
                    name: plan.name,
                    role: plan.role,
                    price: plan.price,
                    duration: createSubscriptionDto.duration,
                    features: [],//todo-now
                    isActive: false,
                    isDeleted: false,
                    transactionHistory: [],
                    paymentStatus: PaymentStatus.UNPAID,
                    cancelledAt: null,
                    startTime,
                    endDate,
                })
            );

            if (!newSubscription) {
                throw new InternalServerErrorException({
                    code: ErrorCodes.INTERNAL_SERVER_ERROR,
                    message: 'Failed to create the subscription.'
                });
            }

            return {
                success: true,
                message: 'Subscription created successfully.',
                data: this._subscriptionMapper.toEntity(newSubscription)
            }
        } catch (error) {
            await this._paymentLockingUtility.releaseLock(key);
            throw error;
        }
    }

    async fetchSubscription(userId: string, role: PlanRoleEnum): Promise<IResponse<ISubscription | null>> {
        const subscription = await this._subscriptionRepository.findSubscription(userId, role);

        if (!subscription) {
            return {
                success: false,
                message: 'User has not active subscription plans',
                data: null
            }
        }

        return {
            success: true,
            message: 'Subscription fetched successfully',
            data: this._subscriptionMapper.toEntity(subscription)
        }
    }

    async getUpgradeAmount(role: UserType, currentSubscriptionId: string): Promise<IResponse<number>> {
        const currentSubscriptionDocument = await this._subscriptionRepository.fetchCurrentActiveSubscription(currentSubscriptionId);

        if (!currentSubscriptionDocument) {
            throw new NotFoundException({
                code: ErrorCodes.NO_ACTIVE_SUBSCRIPTION,
                message: `${ErrorMessage.SUBSCRIPTION_NOT_FOUND}`
            });
        }

        const currentSubscription = this._subscriptionMapper.toEntity(currentSubscriptionDocument);

        if (currentSubscription.duration === 'yearly' || !currentSubscription.endDate) {
            throw new InternalServerErrorException('Requested subscription is not possible');
        }

        const yearlyPlanDocument = await this._planRepository.findOne({ role, duration: 'yearly' });
        if (!yearlyPlanDocument) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            messages: ErrorMessage.PLAN_NOT_FOUND
        });

        const yearlyPlan = this._planMapper.toEntity(yearlyPlanDocument);

        const yearlyPrice = yearlyPlan.price;
        const monthlyPrice = currentSubscription.price;

        const upgradeAmount = this._calculateUpgradeAmount(monthlyPrice, yearlyPrice, currentSubscription.startTime.toString());

        return {
            success: true,
            message: 'Subscription upgrade amount fetched.',
            data: upgradeAmount
        }
    }

    async upgradeSubscription(userId: string, userType: UserType, createSubscriptionDto: CreateSubscriptionDto): Promise<IResponse<ISubscription>> {
        const key = this._paymentLockingUtility.generatePaymentKey(userId, userType);

        const acquired = await this._paymentLockingUtility.acquireLock(key, 300);
        if (!acquired) {
            const ttl = await this._paymentLockingUtility.getTTL(key);

            throw new ConflictException({
                code: ErrorCodes.PAYMENT_IN_PROGRESS,
                message: `We are still processing your previous payment. Please try again in ${ttl} seconds.`,
                ttl
            });
        }

        try {
            const isSubscriptionExists = await this._subscriptionRepository.findActiveSubscriptionByUserId(userId, userType);
            if (!isSubscriptionExists) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'You are not subscribed to any plans. Please subscribe a plan to upgrade.'
                });
            }

            const plan = await this._planRepository.findById(createSubscriptionDto.planId);
            if (!plan) {
                throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
            }

            const cancelled = await this._subscriptionRepository.cancelSubscriptionByUserId(userId, userType);
            if (!cancelled) throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Failed to cancel subscription.'
            });

            const { startTime, endDate } = this._getSubscriptionEndDateAndStartDate(plan.duration);
            const newSubscription = await this._subscriptionRepository.create(
                this._subscriptionMapper.toDocument({
                    userId,
                    planId: plan.id,
                    name: plan.name,
                    role: plan.role,
                    price: plan.price,
                    duration: createSubscriptionDto.duration,
                    features: [],//todo-now
                    isActive: false,
                    isDeleted: false,
                    transactionHistory: [],
                    paymentStatus: PaymentStatus.UNPAID,
                    cancelledAt: null,
                    endDate,
                    startTime,
                })
            );

            if (!newSubscription) {
                throw new InternalServerErrorException(ErrorMessage.DOCUMENT_CREATION_ERROR);
            }

            return {
                success: true,
                message: 'Subscription created successfully.',
                data: this._subscriptionMapper.toEntity(newSubscription)
            }
        } catch (error) {
            await this._paymentLockingUtility.releaseLock(key);
            throw error;
        }
    }

    async updatePaymentStatus(userId: string, userType: UserType, data: UpdatePaymentStatusDto): Promise<IResponse> {
        const subscriptionDoc = await this._subscriptionRepository.findSubscriptionById(data.subscriptionId);

        if (!subscriptionDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: `Subscription document not found.`
        });

        const subscription = this._subscriptionMapper.toEntity(subscriptionDoc);

        const updated = await this._subscriptionRepository.updatePaymentStatus(
            subscription.id,
            data.paymentStatus,
        );

        if (!updated) throw new NotFoundException({
            code: ErrorCodes.DATABASE_OPERATION_FAILED,
            message: `Failed to update subscription.`
        });

        const isUpdated = this._isUpdatedUserSubscriptionStatus(userId, userType, subscription.id);
        if (!isUpdated) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: 'Invalid user type.'
        });

        return {
            success: true,
            message: 'subscription updated successfully.'
        }
    }

    async removeSubscription(subscriptionId: string): Promise<IResponse> {
        const result = await this._subscriptionRepository.removeSubscriptionById(subscriptionId);
        return {
            success: result,
            message: result
                ? 'Successfully cleaned subscription'
                : 'Failed to clean subscription'
        }
    }

    async hasActiveSubscription(userId: string, role: PlanRoleEnum): Promise<IResponse<ISubscription>> {
        const hasActiveSubscription = await this._subscriptionRepository.findActiveSubscriptionByUserId(userId, role);

        if (!hasActiveSubscription) {
            return {
                success: false,
                message: 'No active subscription found.',
            }
        }

        return {
            success: true,
            message: 'Subscription fetched successfully.',
            data: this._subscriptionMapper.toEntity(hasActiveSubscription)
        }
    }

    async fetchSubscriptionList(filters: SubscriptionFiltersDto): Promise<IResponse<IAdminFilteredSubscriptionListWithPagination>> {
        const { page = 1, limit = 10, ...filter } = filters;

        let [subscriptionList, total] = await Promise.all([
            this._subscriptionRepository.findFilteredSubscriptionWithPagination(filter, { page, limit }),
            this._subscriptionRepository.count()
        ]);

        if (filter.status && filter.status !== 'all') {
            subscriptionList = subscriptionList.filter((subscription) => {
                if (filter.status === 'active') {
                    return subscription.status === 'active';
                } else if (filter.status === 'inactive') {
                    return subscription.status === 'inactive';
                } else if (filter.status === 'expired') {
                    return subscription.status === 'expired';
                }
            });
        }

        return {
            success: true,
            message: 'Subscription list fetched successfully.',
            data: {
                subscriptions: subscriptionList,
                pagination: {
                    total,
                    page,
                    limit,
                }
            }
        }
    }

    async updateSubscriptionStatus(subscriptionId: string, status: boolean): Promise<IResponse> {
        const updated = await this._subscriptionRepository.updateSubscriptionStatus(subscriptionId, status);

        return {
            success: true,
            message: 'Subscription updated successfully.'
        }
    }
}
