import { ConflictException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SCHEDULE_REPOSITORY_NAME, SERVICE_OFFERED_REPOSITORY_NAME } from '../../../../core/constants/repository.constant';
import { IServiceOfferedRepository } from '../../../../core/repositories/interfaces/serviceOffered-repo.interface';
import { IBookingService } from '../interfaces/booking-service.interface';
import { SelectedServiceDto, IPriceBreakupDto, BookingDto, SelectedServiceType } from '../../dtos/booking.dto';
import { IBookingRepository } from '../../../../core/repositories/interfaces/bookings-repo.interface';
import { BookingStatus, PaymentStatus } from '../../../../core/enum/bookings.enum';
import { IScheduleRepository } from '../../../../core/repositories/interfaces/schedule-repo.interface';
import { IBooking, IBookingResponse } from '../../../../core/entities/interfaces/booking.entity.interface';
import { ICustomerRepository } from '../../../../core/repositories/interfaces/customer-repo.interface';
import { ISlot } from '../../../../core/entities/interfaces/schedule.entity.interface';
import { IProviderRepository } from '../../../../core/repositories/interfaces/provider-repo.interface';




@Injectable()
export class BookingService implements IBookingService {
    private logger = new Logger(BookingService.name);

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
        this.logger.debug(dto);
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
    async createBooking(customerId: string, data: BookingDto): Promise<boolean> {

        const schedule = await this._scheduleRepository.findById(data.slotData.scheduleId);
        if (!schedule) {
            throw new NotFoundException(`Schedule ID ${data.slotData.scheduleId} not found`)
        }

        let updatedSlot: ISlot | undefined;

        try {
            const result = await this._scheduleRepository.findOneAndUpdate(
                {
                    _id: schedule.id,
                    'slots._id': data.slotData.slotId,
                    'slots.takenBy': { $in: [null, ''] },
                },
                {
                    $set: { 'slots.$.takenBy': customerId }
                },
                { new: true }
            );

            if (!result) {
                throw new ConflictException('Slot has already been taken');
            }

            updatedSlot = result.slots.find(slot => slot.id === data.slotData.slotId);
            if (!updatedSlot) {
                throw new NotFoundException(`Slot ID ${data.slotData.slotId} not found`);
            }
        } catch (err) {
            this.logger.error('Failed to update slot in schedule', err);
            throw new InternalServerErrorException(err.message);
        }

        const expectedArrivalTime = this._combineDateAndTime(schedule.scheduleDate, updatedSlot.from);

        try {
            const booking = await this._bookingRepository.create({
                customerId,
                providerId: data.providerId,
                totalAmount: data.total,
                scheduleId: data.slotData.scheduleId,
                slotId: data.slotData.slotId,
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
                transactionId: null,
                paymentStatus: PaymentStatus.UNPAID,
            });

            return !!booking.id;
        } catch (err) {
            this.logger.error('Failed to create booking', err);
            throw new InternalServerErrorException('Failed to create booking');
        }
    }

    // !Todo - Filter.
    async fetchBookings(id: string): Promise<IBookingResponse[]> {
        const bookings = await this._bookingRepository.find({ customerId: id }, { sort: { createdAt: -1 } });

        // If no bookings exist, validate the customer exists
        if (!bookings.length) {
            const customer = await this._customerRepository.findById(id);
            if (!customer) {
                throw new InternalServerErrorException(`Customer with ID ${id} not found.`);
            }
            return [];
        }

        // Process all bookings with resolved services and provider info
        const responseData: IBookingResponse[] = await Promise.all(bookings.map(async (booking) => {
            const provider = await this._providerRepository.findById(booking.providerId);
            if (!provider) {
                throw new InternalServerErrorException(`Provider with ID ${booking.providerId} not found.`);
            }

            const services = await Promise.all(
                booking.services.map(async (serviceItem) => {
                    const serviceData = await this._serviceOfferedRepository.findById(serviceItem.serviceId);
                    if (!serviceData) {
                        throw new InternalServerErrorException(`Service with ID ${serviceItem.serviceId} not found.`);
                    }

                    return {
                        id: serviceData.id,
                        name: serviceData.title
                    }
                })
            );

            return {
                bookingId: booking.id,
                provider: {
                    id: provider.id,
                    name: provider.fullname || provider.username,
                    email: provider.email,
                    phone: provider.phone
                },
                services,
                expectedArrivalTime: booking.expectedArrivalTime,
                bookingStatus: booking.bookingStatus,
                paymentStatus: booking.paymentStatus,
                totalAmount: booking.totalAmount,
                createdAt: booking.createdAt as Date,
            };

        }));

        return responseData;
    }

    private _combineDateAndTime(dateStr: string, timeStr: string): Date {
        const fullDateTimeStr = `${dateStr} ${timeStr}`;
        return new Date(fullDateTimeStr);
    }


    // !Todo - For Later use ☺.
    // private _formatForDisplay(date: Date): string {
    //     const options: Intl.DateTimeFormatOptions = {
    //         weekday: 'short', month: 'short', day: '2-digit',
    //         year: 'numeric', hour: 'numeric', minute: '2-digit',
    //         hour12: true,
    //     };
    //     return date.toLocaleString('en-US', options).replace(',', '');
    // }
}
