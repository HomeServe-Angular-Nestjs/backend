import { Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { IProviderBookingService } from "../interfaces/provider-booking-service.interface";
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SCHEDULE_REPOSITORY_NAME, SERVICE_OFFERED_REPOSITORY_NAME } from "../../../../core/constants/repository.constant";
import { IBookingRepository } from "../../../../core/repositories/interfaces/bookings-repo.interface";
import { IServiceOfferedRepository } from "../../../../core/repositories/interfaces/serviceOffered-repo.interface";
import { IProviderRepository } from "../../../../core/repositories/interfaces/provider-repo.interface";
import { ICustomerRepository } from "../../../../core/repositories/interfaces/customer-repo.interface";
import { IScheduleRepository } from "../../../../core/repositories/interfaces/schedule-repo.interface";
import { IProviderBookingLists } from "../../../../core/entities/interfaces/booking.entity.interface";

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

    async fetchBookingsList(): Promise<IProviderBookingLists[]> {
        const bookings = await this._bookingRepository.find();
        if (!bookings) {
            throw new InternalServerErrorException('Error while fetching bookings');
        }

        const bookingResponse: IProviderBookingLists[] = await Promise.all(bookings.map(async (booking) => {
            const customer = await this._customerRepository.findById(booking.customerId);
            if (!customer) {
                throw new InternalServerErrorException(`customer with ID ${booking.customerId} not found.`);
            }

            const services = await Promise.all(
                booking.services.map(async (serviceItem) => {
                    const serviceData = await this._serviceOfferedRepository.findById(serviceItem.serviceId);
                    if (!serviceData) {
                        throw new InternalServerErrorException(`Service with ID ${serviceItem.serviceId} not found.`);
                    }

                    return {
                        id: serviceData.id,
                        title: serviceData.title,
                        image: serviceData.image
                    }
                })
            );

            return {
                services,
                customer: {
                    id: customer.id,
                    name: customer.fullname || customer.username,
                    avatar: customer.avatar,
                    email: customer.email
                },
                bookingId: booking.id,
                expectedArrivalTime: booking.expectedArrivalTime,
                totalAmount: booking.totalAmount,
                createdAt: booking.createdAt as Date,
                paymentStatus: booking.paymentStatus,
                bookingStatus: booking.bookingStatus,
                totalBookings: bookings.length
            }

        }));

        return bookingResponse;
    }
}