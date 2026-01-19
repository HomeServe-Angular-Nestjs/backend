import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY_NAME, CART_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, PROVIDER_SERVICE_REPOSITORY_NAME, RESERVATION_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { IBookedService, IBooking, IBookingDetailCustomer, IBookingResponse, IBookingWithPagination } from '@core/entities/interfaces/booking.entity.interface';
import { BookingStatus, CancelStatus, PaymentStatus } from '@core/enum/bookings.enum';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { IResponse } from '@core/misc/response.util';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { IProviderServiceRepository } from '@core/repositories/interfaces/provider-service-repo.interface';
import { IReservationRepository } from '@core/repositories/interfaces/reservation-repo.interface';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { AddReviewDto, IPriceBreakupDto, SaveBookingDto, UpdateBookingDto, UpdateBookingPaymentStatusDto } from '@modules/bookings/dtos/booking.dto';
import { IBookingService } from '@modules/bookings/services/interfaces/booking-service.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { SlotStatusEnum } from '@core/enum/slot.enum';
import { IBookingMapper } from '@core/dto-mapper/interface/bookings.mapper.interface';
import { BOOKING_MAPPER, CART_MAPPER, CUSTOMER_MAPPER, TRANSACTION_MAPPER } from '@core/constants/mappers.constant';
import { ITransactionMapper } from '@core/dto-mapper/interface/transaction.mapper.interface';
import { PAYMENT_LOCKING_UTILITY_NAME, PRICING_UTILITY_NAME, TIME_UTILITY_NAME } from '@core/constants/utility.constant';
import { IPricingUtility } from '@core/utilities/interface/pricing.utility.interface';
import { ITimeUtility } from '@core/utilities/interface/time.utility.interface';
import { IWalletRepository } from '@core/repositories/interfaces/wallet-repo.interface';
import { TransactionStatus, TransactionType } from '@core/enum/transaction.enum';
import { IPaymentLockingUtility } from '@core/utilities/interface/payment-locking.utility';
import { ICartRepository } from '@core/repositories/interfaces/cart-repo.interface';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import { ICartMapper } from '@core/dto-mapper/interface/cart-mapper.interface';
import { NOTIFICATION_SERVICE_NAME } from '@core/constants/service.constant';
import { INotificationService } from '@modules/websockets/services/interface/notification-service.interface';
import { NotificationTemplateId, NotificationType } from '@core/enum/notification.enum';
import { BookingDocument } from '@core/schema/bookings.schema';

@Injectable()
export class BookingService implements IBookingService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactor: ILoggerFactory,
        @Inject(PROVIDER_SERVICE_REPOSITORY_NAME)
        private readonly _providerServiceRepository: IProviderServiceRepository,
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(TRANSACTION_REPOSITORY_NAME)
        private readonly _transactionRepository: ITransactionRepository,
        @Inject(WALLET_REPOSITORY_NAME)
        private readonly _walletRepository: IWalletRepository,
        @Inject(PRICING_UTILITY_NAME)
        private readonly _pricingUtility: IPricingUtility,
        @Inject(TIME_UTILITY_NAME)
        private readonly _timeUtility: ITimeUtility,
        @Inject(BOOKING_MAPPER)
        private readonly _bookingMapper: IBookingMapper,
        @Inject(TRANSACTION_MAPPER)
        private readonly _transactionMapper: ITransactionMapper,
        @Inject(PAYMENT_LOCKING_UTILITY_NAME)
        private readonly _paymentLockingUtility: IPaymentLockingUtility,
        @Inject(CART_REPOSITORY_NAME)
        private readonly _cartRepository: ICartRepository,
        @Inject(CUSTOMER_MAPPER)
        private readonly _customerMapper: ICustomerMapper,
        @Inject(CART_MAPPER)
        private readonly _cartMapper: ICartMapper,
        @Inject(RESERVATION_REPOSITORY_NAME)
        private readonly _reservationRepository: IReservationRepository,
        @Inject(NOTIFICATION_SERVICE_NAME)
        private readonly _notificationService: INotificationService,
    ) {
        this.logger = this._loggerFactor.createLogger(BookingService.name);
    }

    private _hasSlotConflict(date: Date, existingBookings: IBooking[], newFrom: string, newTo: string): boolean {
        const newStart = this._timeUtility.apply24hTime(date, newFrom);
        let newEnd = this._timeUtility.apply24hTime(date, newTo);

        // handle overnight slot
        if (newEnd <= newStart) {
            newEnd.setDate(newEnd.getDate() + 1);
        }

        return existingBookings.some(booking => {
            const existingStart = new Date(booking.slot.from);
            let existingEnd = new Date(booking.slot.to);

            if (existingEnd <= existingStart) {
                existingEnd.setDate(existingEnd.getDate() + 1);
            }

            return newStart < existingEnd && newEnd > existingStart;
        });
    }

    async fetchPriceBreakup(customerId: string): Promise<IResponse<IPriceBreakupDto>> {
        const cart = await this._cartRepository.findAndPopulateByCustomerId(customerId);
        if (!cart) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: 'Cart not found'
        });

        const subTotal = cart.items.map(service => service.price);
        const breakup = await this._pricingUtility.computeBreakup(subTotal);

        return {
            success: true,
            message: 'Price breakup fetched successfully',
            data: {
                total: breakup.total,
                subTotal: breakup.subTotal,
                tax: breakup.tax,
            }
        }
    }

    async createBooking(customerId: string, bookingData: SaveBookingDto): Promise<IResponse<IBooking>> {
        const key = this._paymentLockingUtility.generatePaymentKey(customerId, 'customer');

        try {
            // Payment lock is intentionally held after booking creation.
            // It will be released after payment success/failure.
            const acquired = await this._paymentLockingUtility.acquireLock(key, 300);
            if (!acquired) {
                const ttl = await this._paymentLockingUtility.getTTL(key);

                throw new ConflictException({
                    code: ErrorCodes.PAYMENT_IN_PROGRESS,
                    message: `We are still processing your previous payment. Please try again in ${ttl} seconds.`,
                    ttl
                });
            }

            if (bookingData.from === bookingData.to) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Invalid time slot.'
                });
            }

            const isTheSameProviderInCart = await this._cartRepository.isTheSameProviderInCart(customerId, bookingData.providerId);
            if (!isTheSameProviderInCart) throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.PROVIDER_CONFLICT_IN_CART
            });

            const bookingDate = new Date(bookingData.date);
            const bookingOfSameProviderInSameDateDoc = await this._bookingRepository.fetchBookingsByProviderOnSameDate(customerId, bookingData.providerId, bookingDate);
            const bookingOfSameProviderInSameDate = bookingOfSameProviderInSameDateDoc.map(booking => this._bookingMapper.toEntity(booking));

            const hasConflict = this._hasSlotConflict(
                bookingDate,
                bookingOfSameProviderInSameDate,
                bookingData.from,
                bookingData.to
            );

            if (hasConflict) throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.SLOT_ALREADY_TAKEN
            });

            // Check for transient reservations
            const isReserved = await this._reservationRepository.isReserved(
                bookingData.providerId,
                bookingData.from,
                bookingData.to,
                bookingData.date
            );

            // If reserved AND it's not by the current customer, then it's a conflict
            // Note: Since we are in createBooking, if the current customer has a reservation, 
            // we should allow them to proceed.
            if (isReserved) {
                const reservations = await this._reservationRepository.findAllForDate(bookingData.providerId, bookingDate);
                const ownReservation = reservations.find(r =>
                    r.from === bookingData.from &&
                    r.to === bookingData.to &&
                    r.customerId.toString() === customerId
                );

                if (!ownReservation) {
                    throw new BadRequestException({
                        code: ErrorCodes.BAD_REQUEST,
                        message: ErrorMessage.SLOT_ALREADY_TAKEN
                    });
                }
            }

            const [customerDoc, populatedCartDoc] = await Promise.all([
                this._customerRepository.findById(customerId),
                this._cartRepository.findAndPopulateByCustomerId(customerId)
            ]);

            if (!customerDoc) throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Customer not found'
            });

            if (!populatedCartDoc) throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Cart not found'
            });

            if (!populatedCartDoc.items.length) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: ErrorMessage.EMPTY_CART
                });
            }

            const customer = this._customerMapper.toEntity(customerDoc);
            const populatedCart = this._cartMapper.toPopulatedEntity(populatedCartDoc);

            if (!customer.address || !customer.location?.coordinates) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Please add your location.'
                });
            }

            if (!customer.phone) {
                throw new BadRequestException({
                    code: ErrorCodes.BAD_REQUEST,
                    message: 'Please add your phone number.'
                });
            }

            const subTotal = populatedCart.items.map(service => service.price);
            const breakup = await this._pricingUtility.computeBreakup(subTotal);

            const expectedArrivalTime = this._timeUtility.apply24hTime(bookingDate, bookingData.from);
            const services = populatedCart.items.map(service => service.id)

            const mappedBookingDoc = this._bookingMapper.toDocument({
                customerId,
                providerId: bookingData.providerId,
                totalAmount: breakup.total,
                actualArrivalTime: null,
                expectedArrivalTime,
                location: {
                    address: customer.address,
                    coordinates: customer.location?.coordinates
                },
                services,
                slot: {
                    date: bookingDate,
                    from: bookingData.from,
                    to: bookingData.to,
                    status: SlotStatusEnum.ON_HOLD
                },
                bookingStatus: BookingStatus.PENDING,
                cancellationReason: null,
                cancelStatus: null,
                cancelledAt: null,
                transactionHistory: [],
                paymentStatus: PaymentStatus.UNPAID,
                review: null,
                respondedAt: null
            })

            let bookingDoc: BookingDocument | null;
            try {
                bookingDoc = await this._bookingRepository.create(mappedBookingDoc);

                if (!bookingDoc) {
                    this.logger.error('Failed to create new booking.');
                    throw new InternalServerErrorException({
                        code: ErrorCodes.INTERNAL_SERVER_ERROR,
                        message: ErrorMessage.INTERNAL_SERVER_ERROR,
                    });
                }
            } catch (error) {
                if (error?.code === 11000) {
                    throw new BadRequestException({
                        code: ErrorCodes.BAD_REQUEST,
                        message: ErrorMessage.SLOT_ALREADY_TAKEN
                    });
                }
                throw error;
            }

            // Cleanup reservation if exists
            if (bookingDoc) {
                await this._reservationRepository.deleteOne({
                    providerId: bookingData.providerId,
                    from: bookingData.from,
                    to: bookingData.to,
                    date: bookingDate,
                    customerId: customerId
                });
            }

            return {
                success: true,
                message: 'Service booked successfully.',
                data: this._bookingMapper.toEntity(bookingDoc)
            }
        } catch (error) {
            await this._paymentLockingUtility.releaseLock(key);
            throw error;
        }
    }

    async fetchBookings(customerId: string, page: number = 1): Promise<IBookingWithPagination> {
        const limit = 4;
        const skip = (page - 1) * limit;

        const total = await this._bookingRepository.countDocumentsByCustomer(customerId);
        if (!total) return { bookingData: [], paginationData: { total: 0, page, limit } };

        const bookingDocs = await this._bookingRepository.findBookingsByCustomerIdWithPagination(customerId, skip, limit);

        const bookings = bookingDocs.map(booking => this._bookingMapper.toEntity(booking));

        // Map and enrich booking data
        const bookingData: IBookingResponse[] = await Promise.all(
            bookings.map(async (booking) => {
                const provider = await this._providerRepository.findById(booking.providerId.toString());
                if (!provider) {
                    throw new InternalServerErrorException(`Provider with ID ${booking.providerId} not found.`);
                }

                const services = await Promise.all(
                    booking.services.map(async serviceId => {
                        const service = await this._providerServiceRepository.findOneAndPopulateById(serviceId);

                        if (!service) throw new InternalServerErrorException({
                            code: ErrorCodes.INTERNAL_SERVER_ERROR,
                            message: ErrorMessage.INTERNAL_SERVER_ERROR
                        });

                        return service.categoryId.name;
                    })
                );

                const transaction = booking.transactionHistory
                    .find(t => t.transactionType === TransactionType.BOOKING_PAYMENT && t.status === TransactionStatus.SUCCESS);

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
                    cancelStatus: booking.cancelStatus,
                    paymentStatus: booking.paymentStatus,
                    totalAmount: booking.totalAmount / 100,
                    createdAt: booking.createdAt as Date,
                    review: booking.review,
                    transaction: transaction ? {
                        transactionId: transaction.id,
                        paymentSource: transaction.source,
                    } : null,
                };
            })
        );

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
        const bookingDoc = await this._bookingRepository.findById(bookingId);
        if (!bookingDoc) {
            throw new InternalServerErrorException(`Booking with ID ${bookingId} not found.`);
        }

        const booking = this._bookingMapper.toEntity(bookingDoc);

        const [provider] = await Promise.all([
            this._providerRepository.findById(booking.providerId),
            this._customerRepository.findById(booking.customerId),
        ]);

        if (!provider) {
            throw new InternalServerErrorException(`Provider with ID ${booking.providerId} not found.`);
        }

        const orderedServices: IBookedService[] = (await Promise.all(
            booking.services.map(async serviceId => {
                const service = await this._providerServiceRepository.findOneAndPopulateById(serviceId);

                if (!service) throw new InternalServerErrorException({
                    code: ErrorCodes.INTERNAL_SERVER_ERROR,
                    message: ErrorMessage.INTERNAL_SERVER_ERROR
                });

                return {
                    title: service.categoryId.name,
                    price: service.price,
                    estimatedTime: service.estimatedTimeInMinutes,
                }
            })
        ))

        const transaction = booking.transactionHistory
            .filter(t => t.transactionType === TransactionType.BOOKING_PAYMENT && t.status === TransactionStatus.SUCCESS)
            .sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime())[0];

        return {
            bookingId: booking.id,
            bookingStatus: booking.bookingStatus,
            paymentStatus: booking.paymentStatus,
            createdAt: booking.createdAt as Date,
            expectedArrivalTime: booking.expectedArrivalTime,
            totalAmount: booking.totalAmount / 100,
            cancelledAt: booking.cancelledAt,
            cancelReason: booking.cancellationReason,
            cancelStatus: booking.cancelStatus,
            provider: {
                name: provider.fullname || provider.username,
                email: provider.email,
                phone: provider.phone,
                location: provider.address
            },
            orderedServices,
            transaction: transaction ? {
                id: transaction.id,
                paymentMethod: transaction.source,
                paymentDate: transaction.createdAt as Date,
            } : null,
        }
    }

    async markBookingCancelledByCustomer(customerId: string, bookingId: string, reason: string): Promise<IResponse<IBookingResponse>> {
        const bookingDoc = await this._bookingRepository.markBookingCancelledByCustomer(
            customerId,
            bookingId,
            reason,
            CancelStatus.IN_PROGRESS,
            BookingStatus.IN_PROGRESS
        );

        if (!bookingDoc) {
            this.logger.error('while cancelling booking ' + bookingId + 'Updated booking document not found for ' + bookingId);
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'This booking cannot be cancelled at this stage.'
            });
        }

        const updatedBooking = this._bookingMapper.toEntity(bookingDoc);

        const providerDoc = await this._providerRepository.findById(updatedBooking.providerId.toString());
        if (!providerDoc) {
            throw new InternalServerErrorException(`Provider with ID ${updatedBooking.providerId} not found.`);
        }

        const services = []//todo-today
        //  await Promise.all(
        //     updatedBooking.services.flatMap(async (s) => {
        //         const providerServices = await this._providerServiceRepository.findByIds(s.subserviceIds);
        //         return providerServices.map(ps => ({
        //             id: ps.id,
        //             name: ps.description
        //         }));
        //     })
        // ).then(results => results.flat());//todo-today

        const transaction = updatedBooking.transactionHistory
            .filter(t => t.transactionType === TransactionType.BOOKING_PAYMENT && t.status === TransactionStatus.SUCCESS)
            .sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime())[0];

        const responseData: IBookingResponse = {
            bookingId: updatedBooking.id,
            bookingStatus: updatedBooking.bookingStatus,
            paymentStatus: updatedBooking.paymentStatus,
            createdAt: updatedBooking.createdAt as Date,
            expectedArrivalTime: updatedBooking.expectedArrivalTime,
            totalAmount: updatedBooking.totalAmount / 100,
            cancelStatus: updatedBooking.cancelStatus,
            review: updatedBooking.review,
            services,
            provider: {
                id: updatedBooking.providerId,
                name: providerDoc.fullname || providerDoc.username,
                email: providerDoc.email,
                phone: providerDoc.phone
            },
            transaction: transaction ? {
                transactionId: transaction.id,
                paymentSource: transaction.source,
            } : null,
        }

        // Notify Customer
        await this._sendNotification(
            customerId,
            NotificationTemplateId.BOOKING_CANCELLED,
            NotificationType.EVENT,
            'Booking Cancelled',
            `Your booking #${updatedBooking.id.slice(-6)} has been cancelled.`,
            updatedBooking.id,
            { bookingId: updatedBooking.id, role: 'customer' }
        );

        // Notify Provider
        await this._sendNotification(
            updatedBooking.providerId.toString(),
            NotificationTemplateId.BOOKING_CANCELLED,
            NotificationType.EVENT,
            'Booking Cancelled',
            `Booking #${updatedBooking.id.slice(-6)} has been cancelled by the customer.`,
            updatedBooking.id,
            { bookingId: updatedBooking.id, role: 'provider' }
        );

        return {
            success: true,
            message: 'Request for cancellation has been submitted successfully.',
            data: responseData
        };
    }

    // !TODO
    async updateBooking(updateBookingDto: UpdateBookingDto): Promise<IResponse<IBookingResponse>> {
        const updatedBooking = await this._bookingRepository.findOneAndUpdate(
            { _id: updateBookingDto.bookingId },
            {
                $set: {
                    transactionId: updateBookingDto.transactionId ?? null,
                    paymentStatus: updateBookingDto.transactionId ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                }
            },
            { new: true }
        );

        if (!updatedBooking) {
            throw new NotFoundException(ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        const provider = await this._providerRepository.findById(updatedBooking.providerId);
        if (!provider) {
            throw new NotFoundException('Provider ', ErrorMessage.DOCUMENT_NOT_FOUND);
        }

        const services = [];
        // await Promise.all(
        //     updatedBooking.services.flatMap(async (s) => {
        //         const providerServices = await this._providerServiceRepository.findByIds(s.subserviceIds.map(String));
        //         return providerServices.map(ps => ({
        //             id: ps.id,
        //             name: ps.description
        //         }));
        //     })
        // ).then(results => results.flat());

        const updatedData: IBookingResponse = {
            bookingId: updatedBooking.id,
            bookingStatus: updatedBooking.bookingStatus,
            createdAt: updatedBooking.createdAt as Date,
            expectedArrivalTime: updatedBooking.expectedArrivalTime,
            paymentStatus: updatedBooking.paymentStatus,
            cancelStatus: updatedBooking.cancelStatus,
            provider: {
                email: provider?.email,
                id: provider.id,
                name: provider?.fullname || provider?.username,
                phone: provider.phone
            },
            services,
            totalAmount: updatedBooking.totalAmount / 100,
            transaction: null,
            review: updatedBooking.review,
        }

        return {
            success: true,
            message: 'Successfully booked the service',
            data: updatedData
        }
    }

    async updateBookingPaymentStatus(updatePaymentDto: UpdateBookingPaymentStatusDto): Promise<IResponse<boolean>> {
        const bookingDoc = await this._bookingRepository.findById(updatePaymentDto.bookingId);

        if (!bookingDoc) {
            this.logger.error('Booking not found for ' + updatePaymentDto.bookingId);
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Booking not found',
            })
        }

        const paymentTransactions = (bookingDoc.transactionHistory ?? [])
            .filter(t =>
                t.transactionType === TransactionType.BOOKING_PAYMENT &&
                t.status === TransactionStatus.SUCCESS,
            )
            .sort((a, b) => (a.createdAt as any) - (b.createdAt as any));

        const transaction = paymentTransactions
            .map(t => this._transactionMapper.toEntity(t))
            .at(-1);

        if (!transaction) {
            this.logger.error('Transaction not found for booking ' + updatePaymentDto.bookingId);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }

        const result = await this._bookingRepository.updatePaymentStatus(
            updatePaymentDto.bookingId,
            updatePaymentDto.paymentStatus,
        );

        if (result && updatePaymentDto.paymentStatus === PaymentStatus.PAID) {
            await this._sendNotification(
                bookingDoc.customerId.toString(),
                NotificationTemplateId.BOOKING_CONFIRMED,
                NotificationType.EVENT,
                'Booking Confirmed',
                `Your booking #${bookingDoc.id.slice(-6)} has been confirmed!`,
                bookingDoc.id,
                { bookingId: bookingDoc.id }
            );

            await this._sendNotification(
                bookingDoc.providerId.toString(),
                NotificationTemplateId.BOOKING_CONFIRMED,
                NotificationType.EVENT,
                'New Booking',
                `You have a new confirmed booking #${bookingDoc.id.slice(-6)}!`,
                bookingDoc.id,
                { bookingId: bookingDoc.id }
            );
        }

        return {
            success: !!result,
            message: !!result ? 'Status updated successfully' : 'Failed to update status',
            data: !!result
        }
    }

    async addReview(addReviewDto: AddReviewDto): Promise<IResponse> {
        const isAdded = await this._bookingRepository.addReview(
            addReviewDto.bookingId,
            addReviewDto.description,
            addReviewDto.ratings
        );

        return {
            success: isAdded,
            message: isAdded ? 'Review added successfully.' : 'Failed to add review.'
        }
    }

    async canStartVideoCall(customerId: string, providerId: string): Promise<IResponse> {
        const hasOngoingBooking = await this._bookingRepository.isAnyBookingOngoing(customerId, providerId);
        return {
            success: hasOngoingBooking,
            message: hasOngoingBooking ? "OK to call" : 'No ongoing booking found.'
        }
    }

    private async _sendNotification(
        userId: string,
        templateId: NotificationTemplateId,
        type: NotificationType,
        title: string,
        message: string,
        entityId?: string,
        metadata?: any
    ) {
        try {
            await this._notificationService.createNotification(userId, {
                templateId,
                type,
                title,
                message,
                entityId,
                metadata
            });
        } catch (error) {
            this.logger.error('Failed to send notification', error);
        }
    }
}