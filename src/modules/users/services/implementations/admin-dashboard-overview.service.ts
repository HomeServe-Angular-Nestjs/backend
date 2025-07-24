import { Inject, Injectable } from "@nestjs/common";
import { IAdminDashboardOverviewService } from "../interfaces/admin-dashboard-overview-service.interface";
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SUBSCRIPTION_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME } from "src/core/constants/repository.constant";
import { IProviderRepository } from "src/core/repositories/interfaces/provider-repo.interface";
import { IAdminDashboardOverview, IAdminDashboardRevenue, IAdminDashboardSubscription, IAdminDashboardUserStats } from "src/core/entities/interfaces/admin.entity.interface";
import { IResponse } from "src/core/misc/response.util";
import { ITransactionRepository } from "src/core/repositories/interfaces/transaction-repo.interface";
import { CustomLogger } from "src/core/logger/custom-logger";
import { ISubscriptionRepository } from "src/core/repositories/interfaces/subscription-repo.interface";
import { ICustomerRepository } from "src/core/repositories/interfaces/customer-repo.interface";
import { IBookingRepository } from "src/core/repositories/interfaces/bookings-repo.interface";
import { ITopProviders } from "src/core/entities/interfaces/user.entity.interface";

@Injectable()
export class AdminDashboardOverviewService implements IAdminDashboardOverviewService {
    private readonly logger = new CustomLogger(AdminDashboardOverviewService.name);

    constructor(
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(TRANSACTION_REPOSITORY_NAME)
        private readonly _transactionRepository: ITransactionRepository,
        @Inject(SUBSCRIPTION_REPOSITORY_NAME)
        private readonly _subscriptionRepository: ISubscriptionRepository,
    ) { }

    async getDashboardOverview(): Promise<IResponse<IAdminDashboardOverview>> {
        const now = new Date();

        // --- Time Ranges ---
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const endOfToday = new Date(now.setHours(23, 59, 59, 999));

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const [totalProviders, totalCustomers, activeProviders, pendingVerifications] = await Promise.all([
            this._providerRepository.count(),
            this._customerRepository.count(),
            this._providerRepository.count({ isActive: true }),
            this._providerRepository.count({ verificationStatus: 'pending' }),
        ]);

        const totalUsers = totalProviders + totalCustomers;

        const todaysBookings = await this._bookingRepository.count({
            createdAt: { $gte: startOfToday, $lte: endOfToday },
            bookingStatus: 'confirmed',
        });

        const [newCustomersThisWeek, newProvidersThisWeek] = await Promise.all([
            this._customerRepository.count({ createdAt: { $gte: startOfWeek } }),
            this._providerRepository.count({ createdAt: { $gte: startOfWeek } }),
        ]);

        const newUsersThisWeek = newCustomersThisWeek + newProvidersThisWeek;

        const weeklyTransactions = await this._transactionRepository.getTotalRevenue(sevenDaysAgo);

        return {
            success: true,
            message: "Dashboard overview data fetched successfully",
            data: {
                totalUsers,
                totalProviders,
                totalCustomers,
                activeProviders,
                pendingVerifications,
                todaysBookings,
                newUsersThisWeek,
                weeklyTransactions
            }
        };
    }

    async getDashBoardRevenue(): Promise<IResponse<IAdminDashboardRevenue[]>> {
        const transactions = await this._transactionRepository.find();
        const revenueData = transactions.map(tx => ({
            amount: tx.amount,
            createdAt: tx.createdAt?.toString() || ''
        }));

        return {
            success: true,
            message: "Dashboard revenue data fetched successfully",
            data: revenueData
        }
    }

    async getSubscriptionData(): Promise<IResponse<IAdminDashboardSubscription>> {
        const subscriptionData = await this._subscriptionRepository.getSubscriptionChartData();
        return {
            success: true,
            message: "Subscription data fetched successfully",
            data: subscriptionData
        };
    }

    async getUserStatistics(): Promise<IResponse<IAdminDashboardUserStats>> {
        const [customerStats, providerStats] = await Promise.all([
            this._customerRepository.getCustomerStatistics(),
            this._providerRepository.getProviderStatistics(),
        ]);

        return {
            success: true,
            message: "User statistics fetched successfully",
            data: {
                customer: customerStats,
                provider: providerStats
            }
        };
    }

    async getTopProviders(): Promise<IResponse<ITopProviders[]>> {
        const topProviders = await this._bookingRepository.getTopProviders();

        return {
            success: true,
            message: "Top providers fetched successfully",
            data: topProviders
        };
    }
}