import { SLOT_RULE_MAPPER } from "@core/constants/mappers.constant";
import { BOOKING_REPOSITORY_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SERVICE_OFFERED_REPOSITORY_NAME, SLOT_RULE_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ISlotRuleMapper } from "@core/dto-mapper/interface/slot-rule.mapper.interface";
import { ISlotRule, WeekType } from "@core/entities/interfaces/slot-rule.entity.interface";
import { IProviderDashboardOverview } from "@core/entities/interfaces/user.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { IBookingRepository } from "@core/repositories/interfaces/bookings-repo.interface";
import { IProviderRepository } from "@core/repositories/interfaces/provider-repo.interface";
import { IServiceOfferedRepository } from "@core/repositories/interfaces/serviceOffered-repo.interface";
import { ISlotRuleRepository } from "@core/repositories/interfaces/slot-rule-repo.interface";
import { IProviderDashboardService } from "@modules/providers/services/interfaces/dashboard-service.interface";
import { Inject, Injectable } from "@nestjs/common";

type Slot = { from: Date; to: Date };

@Injectable()
export class providerDashboardService implements IProviderDashboardService {
    constructor(
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(SLOT_RULE_REPOSITORY_NAME)
        private readonly _slotRuleRepository: ISlotRuleRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
        private readonly _serviceOfferedRepository: IServiceOfferedRepository,
        @Inject(SLOT_RULE_MAPPER)
        private readonly _slotRuleMapper: ISlotRuleMapper,
    ) { }

    private _getNextAvailableSlot(rules: ISlotRule[]): Slot | null {
        if (!rules.length) return null;

        const now = new Date();
        let nextSlot: Slot | null = null;

        for (const rule of rules) {
            const startDate = new Date(rule.startDate);
            const endDate = new Date(rule.endDate);

            // excluded date strings for quick comparison
            const excludeDates = rule.excludeDates.map((d) => new Date(d).toDateString());

            // Start from today or rule start date
            let currentDate = startDate > now ? new Date(startDate) : new Date(now);

            while (currentDate <= endDate) {
                const dayName = currentDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                }) as WeekType;

                // Skip invalid days or excluded dates
                if (
                    !rule.daysOfWeek.includes(dayName) ||
                    excludeDates.includes(currentDate.toDateString())
                ) {
                    currentDate.setDate(currentDate.getDate() + 1);
                    continue;
                }

                // finding a slot for this date
                const nextSlotForDay = this._generateNextSlotForDay(rule, currentDate, now);
                if (nextSlotForDay) {
                    const currentNextSlot = nextSlot as Slot | null;

                    if (!currentNextSlot || nextSlotForDay.from < currentNextSlot.from) {
                        nextSlot = nextSlotForDay;
                    }

                    return nextSlot;
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        return nextSlot;
    }

    private _generateNextSlotForDay(rule: ISlotRule, date: Date, now: Date): Slot | null {
        const [startHour, startMin] = rule.startTime.split(':').map(Number);
        const [endHour, endMin] = rule.endTime.split(':').map(Number);

        const start = new Date(date);
        start.setHours(startHour, startMin, 0, 0);

        const end = new Date(date);
        end.setHours(endHour, endMin, 0, 0);

        let current = new Date(start);

        while (current < end) {
            const from = new Date(current);
            const to = new Date(from.getTime() + rule.slotDuration * 60000);

            // If slot exceeds working window
            if (to > end) break;

            // Return if this slot is in the future
            if (from > now) return { from, to };

            // Move forward by slot duration + break duration
            current = new Date(
                current.getTime() + (rule.slotDuration + rule.breakDuration) * 60000
            );
        }

        return null;
    }

    async getDashboardOverviewBreakdown(providerId: string): Promise<IResponse<IProviderDashboardOverview>> {
        const [revenue, bookings, avgRating, completionRate, availability, activeServiceCount] = await Promise.all([
            this._bookingRepository.getRevenueBreakdown(providerId),
            this._bookingRepository.getBookingsBreakdown(providerId),
            this._bookingRepository.getAvgRating(providerId),
            this._bookingRepository.getBookingsCompletionRate(providerId),
            this._providerRepository.getWorkingHours(providerId),
            this._serviceOfferedRepository.getActiveServiceCount(providerId)
        ]);

        const ruleDocs = await this._slotRuleRepository.findActiveRulesByProviderId(providerId);
        const rules = ruleDocs.map(doc => this._slotRuleMapper.toEntity(doc));
        const nextAvailableSlot = this._getNextAvailableSlot(rules)

        const response: IProviderDashboardOverview = {
            revenue,
            bookings,
            avgRating,
            nextAvailableSlot,
            availability,
            completionRate,
            activeServiceCount
        };

        return {
            success: true,
            message: `Provider dashboard overview breakdown fetched successfully.`,
            data: response,
        }

    }
}