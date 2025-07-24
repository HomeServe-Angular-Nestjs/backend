import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { IAdminBookingService } from "../interfaces/admin-bookings-service.interface";
import { IResponse } from "src/core/misc/response.util";
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "src/core/constants/repository.constant";
import { IBookingRepository } from "src/core/repositories/interfaces/bookings-repo.interface";
import { ICustomerRepository } from "src/core/repositories/interfaces/customer-repo.interface";
import { ErrorMessage } from "src/core/enum/error.enum";
import { IAdminBookingForTable, IBookingStats, IPaginatedBookingsResponse } from "src/core/entities/interfaces/booking.entity.interface";
import { IProviderRepository } from "src/core/repositories/interfaces/provider-repo.interface";
import { GetBookingsFilter } from "../../dtos/admin-user.dto";
import { Types } from "mongoose";

@Injectable()
export class AdminBookingService implements IAdminBookingService {
    private readonly logger = new Logger(AdminBookingService.name);

    constructor(
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
    ) { }

    async fetchBookings(dto: GetBookingsFilter): Promise<IResponse<IPaginatedBookingsResponse>> {
        const page = dto.page || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        let bookingFilter: any = {};

        // Search by Customer name/email (partial match)
        if (dto.search && dto.searchBy === 'customer') {
            const customers = await this._customerRepository.find({
                $or: [
                    { username: { $regex: dto.search, $options: 'i' } },
                    { email: { $regex: dto.search, $options: 'i' } },
                ],
            });

            const customerIds = customers.map((c) => c.id);
            bookingFilter.customerId = { $in: customerIds };
        }

        // Filter by booking status
        if (dto.bookingStatus) {
            bookingFilter.bookingStatus = dto.bookingStatus;
        }

        // Filter by payment status
        if (dto.paymentStatus) {
            bookingFilter.paymentStatus = dto.paymentStatus;
        }

        // Fetch bookings and total count
        const [bookings, total] = await Promise.all([
            this._bookingRepository.find(bookingFilter, {
                skip,
                limit,
                sort: { createdAt: -1 },
            }),
            this._bookingRepository.count(bookingFilter),
        ]);

        // Build response
        const bookingResponseData: IAdminBookingForTable[] = await Promise.all(
            bookings.map(async (booking) => {
                const [customer, provider] = await Promise.all([
                    this._customerRepository.findById(booking.customerId),
                    this._providerRepository.findById(booking.providerId),
                ]);

                if (!customer) {
                    throw new NotFoundException(ErrorMessage.CUSTOMER_NOT_FOUND_WITH_ID, booking.customerId);
                }

                if (!provider) {
                    throw new NotFoundException(ErrorMessage.PROVIDER_NOT_FOUND, booking.providerId);
                }

                return {
                    bookingId: booking.id,
                    customer: {
                        avatar: customer.avatar,
                        id: customer.id,
                        username: customer.username,
                        email: customer.email,
                    },
                    provider: {
                        avatar: provider.avatar,
                        id: provider.id,
                        username: provider.username,
                        email: provider.email,
                    },
                    date: booking.createdAt as Date,
                    status: booking.bookingStatus,
                    paymentStatus: booking.paymentStatus,
                };
            }),
        );

        let filteredBookings = bookingResponseData;
        if (dto.search && dto.searchBy === 'id') {
            filteredBookings = filteredBookings.filter(b =>
                b.bookingId.toLowerCase().includes(dto.search.toLowerCase())
            );
        }

        return {
            success: true,
            message: 'Booking data fetched successfully',
            data: {
                bookingData: filteredBookings,
                pagination: {
                    total,
                    page,
                    limit,
                },
            },
        };
    }

    async getBookingStats(): Promise<IResponse<IBookingStats>> {
        const bookingStats = await this._bookingRepository.bookingStatus();
        if (!bookingStats) {
            throw new InternalServerErrorException('Mongo aggregation failed.');
        }

        return {
            success: true,
            message: 'Booking stats fetched.',
            data: bookingStats
        }
    }
}