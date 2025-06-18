import { ConflictException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SCHEDULES_REPOSITORY_NAME, SERVICE_OFFERED_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME } from '../../../../core/constants/repository.constant';
import { IBookingDetailCustomer, IBookingResponse, IBookingWithPagination } from '../../../../core/entities/interfaces/booking.entity.interface';
import { BookingStatus, PaymentStatus } from '../../../../core/enum/bookings.enum';
import { IServiceOfferedRepository } from '../../../../core/repositories/interfaces/serviceOffered-repo.interface';
import { ISchedulesRepository } from '../../../../core/repositories/interfaces/schedules-repo.interface';
import { IProviderRepository } from '../../../../core/repositories/interfaces/provider-repo.interface';
import { ICustomerRepository } from '../../../../core/repositories/interfaces/customer-repo.interface';
import { IBookingRepository } from '../../../../core/repositories/interfaces/bookings-repo.interface';
import { SelectedServiceDto, IPriceBreakupDto, BookingDto } from '../../dtos/booking.dto';
import { IBookingService } from '../interfaces/booking-service.interface';
import { Types } from 'mongoose';
import { IResponse } from 'src/core/misc/response.util';
import { IScheduleDay, ISlot } from 'src/core/entities/interfaces/schedules.entity.interface';
import { ITransactionRepository } from 'src/core/repositories/interfaces/transaction-repo.interface';




@Injectable()
export class BookingService implements IBookingService {
    private logger = new Logger(BookingService.name);

    constructor(
        @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
        private readonly _serviceOfferedRepository: IServiceOfferedRepository,
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(SCHEDULES_REPOSITORY_NAME)
        private readonly _scheduleRepository: ISchedulesRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(TRANSACTION_REPOSITORY_NAME)
        private readonly _transactionRepository: ITransactionRepository,
    ) { }



    /**
     * Calculates the detailed price breakup for a list of selected services and subServices.
     *
     * This method performs the following:
     * - Retrieves services by IDs from the database.
     * - Filters each service’s subServices based on the user’s selected subservice IDs.
     * - Computes the subtotal from the matched subServices' prices.
     * - Adds a fixed visiting fee and applies an 18% tax rate.
     *
     * @param {SelectedServiceDto[]} dto - Array of user-selected service and subservice identifiers.
     * @returns {Promise<IPriceBreakupData>} An object containing subtotal, tax, visiting fee, and total amount.
     *
     * @throws {Error} If:
     * - The `dto` array is empty or undefined.
     * - A service is not found for a given service ID.
     * - Any subservice contains a non-numeric or invalid price.
     *
     * */
    async preparePriceBreakup(dto: SelectedServiceDto[]): Promise<IPriceBreakupDto> {
        // Fetch all selected services from the repository
        let services = await Promise.all(
            dto.map(item => this._serviceOfferedRepository.findOne({ _id: item.serviceId }))
        );

        // Filter each service's subServices to include only the ones selected by the user
        const filteredServices = services.map((service, index) => {
            const selectedSubServiceIds = dto[index].subServiceIds;

            // Filter subServices by the selected subservice IDs
            const matchedSubServices = service?.subService.filter(sub =>
                selectedSubServiceIds.includes(sub.id as string)
            );

            return {
                ...service,
                subService: matchedSubServices
            };
        });

        let subTotal = 0;
        filteredServices.forEach(service => {
            (service.subService ?? []).forEach(sub => {
                const price = Number(sub.price);
                if (isNaN(price)) {
                    throw new Error(`Invalid price in subservice: ${sub.title || 'Unnamed SubService'}`);
                }
                subTotal += price;
            });
        })

        const visitingFee = 50;
        const taxRate = 0.18;
        const tax = parseFloat((subTotal * taxRate).toFixed(2));
        const total = subTotal + visitingFee + tax;

        return {
            subTotal,
            tax,
            visitingFee,
            total,
        };
    }

    /**
     * Creates a booking for a customer by selecting an available slot from a given schedule.
     * 
     * This method:
     * 1. Verifies the existence of the schedule.
     * 2. Atomically attempts to mark the selected slot as taken by the customer (ensures no race conditions).
     * 3. Calculates the expected arrival time based on schedule date and slot's start time.
     * 4. Creates a booking entry in the booking repository.
     * 
     * @param {string} customerId - ID of the customer making the booking.
     * @param {BookingDto} data - Booking data including slot info, location, provider, and selected services.
     * @returns {Promise<boolean>} - Returns true if the booking is successfully created; otherwise, throws an error.
     * 
     * @throws {NotFoundException} - If the schedule or slot is not found.
     * @throws {ConflictException} - If the slot is already taken.
     * @throws {InternalServerErrorException} - If any unexpected issue occurs during the update or booking creation.
     */
    async createBooking(customerId: string, data: BookingDto): Promise<IResponse> {
        const { dayId, month, scheduleId, slotId } = data.slotData;
        const scheduleObjectId = new Types.ObjectId(scheduleId);
        const dayObjectId = new Types.ObjectId(dayId);
        const slotObjectId = new Types.ObjectId(slotId);
        const customerObjectId = new Types.ObjectId(customerId);

        const schedule = await this._scheduleRepository.findById(scheduleObjectId);
        if (!schedule) {
            throw new NotFoundException(`Schedule ID ${scheduleId} not found`)
        }

        let updatedSlot: ISlot | undefined;
        let updatedDay: IScheduleDay | undefined;

        try {
            const result = await this._scheduleRepository.findOneAndUpdate(
                {
                    _id: scheduleObjectId,
                    month,
                    'days._id': dayObjectId,
                    'days.slots._id': slotObjectId
                },
                {
                    $set: {
                        'days.$[day].slots.$[slot].takenBy': customerObjectId
                    }
                },
                {
                    arrayFilters: [
                        { 'day._id': dayObjectId },
                        { 'slot._id': slotObjectId }
                    ],
                    new: true
                }
            );

            if (!result) {
                throw new ConflictException('Slot has already been taken');
            }

            updatedDay = result.days.find(day => day.id === dayId);
            updatedSlot = updatedDay?.slots.find(slot => slot.id === slotId);

            if (!updatedSlot) {
                throw new NotFoundException(`Slot ID ${data.slotData.slotId} not found`);
            }
        } catch (err) {
            this.logger.error('Failed to update slot in schedule', err);
            throw new InternalServerErrorException(err.message);
        }

        if (!updatedDay || !updatedSlot) {
            throw new NotFoundException('slot data missing.');
        }

        const expectedArrivalTime = this._combineDateAndTime(updatedDay.date, updatedSlot.from);

        try {
            await this._bookingRepository.create({
                customerId,
                providerId: data.providerId,
                totalAmount: data.total,
                scheduleData: {
                    scheduleId,
                    month,
                    dayId,
                    slotId,
                },
                actualArrivalTime: null,
                expectedArrivalTime,
                location: {
                    address: data.location.address,
                    coordinates: data.location.coordinates
                },
                services: data.serviceIds.map(s => ({
                    serviceId: s.id,
                    subserviceIds: s.selectedIds
                })),
                bookingStatus: BookingStatus.PENDING,
                cancellationReason: null,
                cancelledAt: null,
                transactionId: data.transactionId,
                paymentStatus: data.transactionId ? PaymentStatus.PAID : PaymentStatus.UNPAID,
            });

        } catch (err) {
            this.logger.error('Failed to create booking', err);
            throw new InternalServerErrorException('Failed to create booking');
        }

        return {
            success: true,
            message: 'Service booked successfully.'
        }
    }

    async fetchBookings(id: string, page: number = 1): Promise<IBookingWithPagination> {
        const limit = 4;
        const skip = (page - 1) * limit;

        // Get total count first for pagination metadata
        const total = await this._bookingRepository.count({ customerId: id });

        if (!total) {
            const customer = await this._customerRepository.findById(id);
            if (!customer) {
                throw new InternalServerErrorException(`Customer with ID ${id} not found.`);
            }

            return {
                bookingData: [],
                paginationData: { total: 0, page, limit }
            }
        }

        // Get only the bookings for the requested page
        const paginatedBookings = await this._bookingRepository.find(
            { customerId: id },
            {
                sort: { createdAt: -1 },
                skip,
                limit,
            });

        // Map and enrich booking data
        const bookingData: IBookingResponse[] = await Promise.all(
            paginatedBookings.map(async (booking) => {
                const provider = await this._providerRepository.findById(booking.providerId);
                if (!provider) {
                    throw new InternalServerErrorException(`Provider with ID ${booking.providerId} not found.`);
                }

                const services = await Promise.all(
                    booking.services.map(async (s) => {
                        const service = await this._serviceOfferedRepository.findById(s.serviceId);
                        if (!service) {
                            throw new InternalServerErrorException(`Service with ID ${s.serviceId} not found.`);
                        }

                        return {
                            id: service.id,
                            name: service.title
                        };
                    })
                );
                return {
                    bookingId: booking.id,
                    provider: {
                        id: provider.id,
                        name: provider.fullname || provider.username,
                        email: provider.email,
                        phone: provider.phone,
                    },
                    services,
                    expectedArrivalTime: booking.expectedArrivalTime,
                    bookingStatus: booking.bookingStatus,
                    paymentStatus: booking.paymentStatus,
                    totalAmount: booking.totalAmount,
                    createdAt: booking.createdAt as Date,
                };
            })
        );

        // Return structured paginated response
        return {
            bookingData,
            paginationData: {
                total,
                page,
                limit
            }
        };
    }

    async fetchBookingDetails(bookingId: string): Promise<IBookingDetailCustomer> {
        const booking = await this._bookingRepository.findById(bookingId);
        if (!booking) {
            throw new InternalServerErrorException(`Booking with ID ${bookingId} not found.`);
        }

        const provider = await this._providerRepository.findById(booking.providerId);
        if (!provider) {
            throw new InternalServerErrorException(`Provider with ID ${booking.providerId} not found.`);
        }

        const transaction = await this._transactionRepository.findById(booking.transactionId ?? '');

        const orderedServices = (
            await Promise.all(
                booking.services.map(async (s) => {
                    const service = await this._serviceOfferedRepository.findById(s.serviceId);
                    if (!service) {
                        throw new InternalServerErrorException(`Service with ID ${s.serviceId} not found.`);
                    }

                    return service.subService
                        .filter(sub => sub.id && s.subserviceIds.includes(sub.id))
                        .map(sub => ({
                            title: sub.title as string,
                            price: sub.price as string,
                            estimatedTime: sub.estimatedTime as string
                        }));
                })
            )
        ).flat();



        return {
            bookingId: booking.id,
            bookingStatus: booking.bookingStatus,
            paymentStatus: booking.paymentStatus,
            createdAt: booking.createdAt as Date,
            expectedArrivalTime: booking.expectedArrivalTime,
            totalAmount: booking.totalAmount,
            provider: {
                name: provider.fullname || provider.username,
                email: provider.email,
                phone: provider.phone
            },
            orderedServices,
            transaction: transaction ? {
                id: transaction.id,
                paymentDate: transaction.createdAt as Date,
                paymentMethod: transaction.method as string
            } : null
        }
    }

    private _combineDateAndTime(dateStr: string, timeStr: string): Date {
        const fullDateTimeStr = `${dateStr} ${timeStr}`;
        return new Date(fullDateTimeStr);
    }
}
