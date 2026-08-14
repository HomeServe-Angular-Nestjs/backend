import {
  BOOKING_REPOSITORY_NAME,
  PROVIDER_REPOSITORY_INTERFACE_NAME,
  PROVIDER_SERVICE_REPOSITORY_NAME,
  WALLET_REPOSITORY_NAME,
} from '@core/constants/repository.constant';
import { IProviderDashboardOverview } from '@core/entities/interfaces/user.entity.interface';
import { IResponse } from '@core/misc/response.util';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { IProviderServiceRepository } from '@core/repositories/interfaces/provider-service-repo.interface';
import { IWalletRepository } from '@core/repositories/interfaces/wallet-repo.interface';
import { IProviderDashboardService } from '@modules/providers/services/interfaces/dashboard-service.interface';
import { UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { IUploadsUtility } from '@core/utilities/interface/upload.utility.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class providerDashboardService implements IProviderDashboardService {
  constructor(
    @Inject(BOOKING_REPOSITORY_NAME)
    private readonly _bookingRepository: IBookingRepository,
    @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
    private readonly _providerRepository: IProviderRepository,
    @Inject(PROVIDER_SERVICE_REPOSITORY_NAME)
    private readonly _providerServiceRepository: IProviderServiceRepository,
    @Inject(WALLET_REPOSITORY_NAME)
    private readonly _walletRepository: IWalletRepository,
    @Inject(UPLOAD_UTILITY_NAME)
    private readonly _uploadsUtility: IUploadsUtility,
  ) {}

  async getDashboardOverviewBreakdown(providerId: string): Promise<IResponse<IProviderDashboardOverview>> {
    const [revenue, bookings, avgRating, completionRate, workingHours, activeServiceCount, nextAvailableSlot, upcoming, recent, wallet] =
      await Promise.all([
        this._bookingRepository.getRevenueBreakdown(providerId),
        this._bookingRepository.getBookingsBreakdown(providerId),
        this._bookingRepository.getAvgRating(providerId),
        this._bookingRepository.getBookingsCompletionRate(providerId),
        this._providerRepository.getWorkingHours(providerId),
        this._providerServiceRepository.count({ providerId, isActive: true }),
        this._bookingRepository.getNextAvailableSlot(providerId),
        this._bookingRepository.getUpcomingBookings(providerId, 5),
        this._bookingRepository.getRecentBookingsByProvider(providerId, 5),
        this._walletRepository.findWallet(providerId),
      ]);

    const recentBookings = recent.map((r) => ({
      ...r,
      customer: r.customer
        ? {
            ...r.customer,
            avatar: r.customer.avatar ? this._uploadsUtility.getSignedImageUrl(r.customer.avatar) : '',
          }
        : r.customer,
      provider: r.provider
        ? {
            ...r.provider,
            avatar: r.provider.avatar ? this._uploadsUtility.getSignedImageUrl(r.provider.avatar) : '',
          }
        : r.provider,
    }));

    const nextBooking = upcoming[0] ?? null;
    if (nextBooking?.customer?.avatar) {
      nextBooking.customer.avatar = this._uploadsUtility.getSignedImageUrl(nextBooking.customer.avatar);
    }

    const response: IProviderDashboardOverview = {
      revenue,
      bookings,
      avgRating,
      nextAvailableSlot,
      workingHours,
      completionRate,
      activeServiceCount,
      nextBooking,
      upcomingBookingCount: upcoming.length,
      recentBookings,
      wallet: wallet ? { balance: wallet.balance } : null,
    };

    return {
      success: true,
      message: `Provider dashboard overview breakdown fetched successfully.`,
      data: response,
    };
  }
}
