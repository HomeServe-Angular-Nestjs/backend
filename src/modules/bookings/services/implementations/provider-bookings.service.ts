import { Inject, Injectable, InternalServerErrorException, Logger, Search } from "@nestjs/common";
import { IProviderBookingService } from "../interfaces/provider-booking-service.interface";
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SCHEDULE_REPOSITORY_NAME, SERVICE_OFFERED_REPOSITORY_NAME } from "../../../../core/constants/repository.constant";
import { IBookingRepository } from "../../../../core/repositories/interfaces/bookings-repo.interface";
import { IServiceOfferedRepository } from "../../../../core/repositories/interfaces/serviceOffered-repo.interface";
import { IProviderRepository } from "../../../../core/repositories/interfaces/provider-repo.interface";
import { ICustomerRepository } from "../../../../core/repositories/interfaces/customer-repo.interface";
import { IScheduleRepository } from "../../../../core/repositories/interfaces/schedule-repo.interface";
import { IProviderBookingLists, IResponseProviderBookingLists } from "../../../../core/entities/interfaces/booking.entity.interface";
import { FilterFileds } from "../../dtos/booking.dto";

@Injectable()
export class ProviderBookingService implements IProviderBookingService {
    private logger = new Logger(ProviderBookingService.name);

    constructor(
        @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
        private readonly _serviceOfferedRepository: IServiceOfferedRepository,
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(SCHEDULE_REPOSITORY_NAME)
        private readonly _scheduleRepository: IScheduleRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository
    ) { }


    async fetchBookingsList(page: number = 1, filters: FilterFileds): Promise<IResponseProviderBookingLists> {
        const limit = 5;
        const skip = (page - 1) * limit;

        const rawBookings = await this._bookingRepository.find({});
        if (!rawBookings.length) {
            return {
                bookingData: [],
                paginationData: { total: 0, page, limit }
            };
        }

        const enrichBookings = await Promise.all(
            rawBookings.map(async (booking) => {
                const customer = await this._customerRepository.findById(booking.customerId);
                if (!customer) throw new InternalServerErrorException(`Customer not found: ${booking.customerId}`);

                const services = await Promise.all(
                    booking.services.map(async (s) => {
                        const service = await this._serviceOfferedRepository.findById(s.serviceId);
                        if (!service) throw new InternalServerErrorException(`Service not found: ${s.serviceId}`);
                        return { id: service.id, title: service.title, image: service.image };
                    })
                );

                return {
                    services,
                    customer: {
                        id: customer.id,
                        name: customer.fullname || customer.username,
                        email: customer.email,
                        avatar: customer.avatar
                    },
                    bookingId: booking.id,
                    expectedArrivalTime: booking.expectedArrivalTime,
                    totalAmount: booking.totalAmount,
                    createdAt: booking.createdAt as Date,
                    paymentStatus: booking.paymentStatus,
                    bookingStatus: booking.bookingStatus,
                };
            })
        );

        let filteredBookings = enrichBookings;

        if (filters.search) {
            const search = filters.search.trim().toLowerCase();
            filteredBookings = enrichBookings.filter((booking) => {
                return (
                    booking.bookingId.toLowerCase().includes(search) ||
                    booking.customer.name.toLowerCase().includes(search) ||
                    booking.customer.email.toLowerCase().includes(search) ||
                    booking.services.some((s) => s.title.toLowerCase().includes(search))
                );
            });
        }

        const total = filteredBookings.length;
        const paginated = filteredBookings.slice(skip, skip + limit);

        return {
            bookingData: paginated,
            paginationData: { page, limit, total }
        }
    }
}