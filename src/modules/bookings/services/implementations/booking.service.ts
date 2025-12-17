import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SERVICE_OFFERED_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { IBooking, IBookingDetailCustomer, IBookingResponse, IBookingWithPagination } from '@core/entities/interfaces/booking.entity.interface';
import { BookingStatus, CancelStatus, PaymentStatus } from '@core/enum/bookings.enum';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { IResponse } from '@core/misc/response.util';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { IServiceOfferedRepository } from '@core/repositories/interfaces/serviceOffered-repo.interface';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { AddReviewDto, BookingDto, SelectedServiceDto, UpdateBookingDto, UpdateBookingPaymentStatusDto } from '@modules/bookings/dtos/booking.dto';
import { IBookingService } from '@modules/bookings/services/interfaces/booking-service.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { SlotStatusEnum } from '@core/enum/slot.enum';
import { IBookingMapper } from '@core/dto-mapper/interface/bookings.mapper.interface';
import { BOOKING_MAPPER, TRANSACTION_MAPPER } from '@core/constants/mappers.constant';
import { ITransactionMapper } from '@core/dto-mapper/interface/transaction.mapper.interface';
import { PAYMENT_LOCKING_UTILITY_NAME, PRICING_UTILITY_NAME, SLOT_UTILITY_NAME, TIME_UTILITY_NAME } from '@core/constants/utility.constant';
import { IPricingBreakup, IPricingUtility } from '@core/utilities/interface/pricing.utility.interface';
import { ISlotUtility } from '@core/utilities/interface/slot.utility.interface';
import { ITimeUtility } from '@core/utilities/interface/time.utility.interface';
import { IWalletRepository } from '@core/repositories/interfaces/wallet-repo.interface';
import { TransactionStatus, TransactionType } from '@core/enum/transaction.enum';
import { IPaymentLockingUtility } from '@core/utilities/interface/payment-locking.utility';

@Injectable()
export class BookingService implements IBookingService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactor: ILoggerFactory,
        @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
        private readonly _serviceOfferedRepository: IServiceOfferedRepository,
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
        @Inject(SLOT_UTILITY_NAME)
        private readonly _slotUtility: ISlotUtility,
        @Inject(TIME_UTILITY_NAME)
        private readonly _timeUtility: ITimeUtility,
        @Inject(BOOKING_MAPPER)
        private readonly _bookingMapper: IBookingMapper,
        @Inject(TRANSACTION_MAPPER)
        private readonly _transactionMapper: ITransactionMapper,
        @Inject(PAYMENT_LOCKING_UTILITY_NAME)
        private readonly _paymentLockingUtility: IPaymentLockingUtility,
    ) {
        this.logger = this._loggerFactor.createLogger(BookingService.name);
    }

    // Calculates the detailed price breakup for a list of selected services and subServices.
    async preparePriceBreakup(serviceDto: SelectedServiceDto[]): Promise<IPricingBreakup> {
        const subServiceIds = serviceDto.flatMap(ids => ids.subServiceIds);
        const subServiceDocuments = await this._serviceOfferedRepository.findSubServicesByIds(subServiceIds);

        const prices = subServiceDocuments.flatMap(sub => {
            const price = Number(sub.price);
            if (isNaN(price)) throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: 'Invalid price'
            });
            return price;
        });

        return await this._pricingUtility.computeBreakup(prices);
    }

    async createBooking(customerId: string, data: BookingDto): Promise<IResponse<IBooking>> {
        const key = this._paymentLockingUtility.generatePaymentKey(customerId, 'customer');

        const acquired = await this._paymentLockingUtility.acquireLock(key, 300);
        if (!acquired) {
            const ttl = await this._paymentLockingUtility.getTTL(key);

            throw new ConflictException({
                code: ErrorCodes.PAYMENT_IN_PROGRESS,
                message: `We are still processing your previous payment. Please try again in ${ttl} seconds.`,
                ttl
            });
        }

        const { slotData } = data;

        const isAvailable = await this._slotUtility.isAvailable(
            slotData.ruleId,
            slotData.date,
            slotData.from,
            slotData.to
        );

        if (!isAvailable) {
            throw new ConflictException({
                code: ErrorCodes.CONFLICT,
                message: 'Slot is already booked.'
            });
        }

        const expectedArrivalTime = this._timeUtility.combineLocalDateAndTimeUTC(slotData.date, slotData.from);

        const bookingDoc = await this._bookingRepository.create(this._bookingMapper.toDocument({
            customerId,
            providerId: data.providerId,
            totalAmount: data.total * 100,
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
            slot: {
                ruleId: slotData.ruleId,
                date: new Date(slotData.date),
                from: slotData.from,
                to: slotData.to,
                status: SlotStatusEnum.PENDING
            },
            bookingStatus: BookingStatus.PENDING,
            cancellationReason: null,
            cancelStatus: null,
            cancelledAt: null,
            transactionHistory: [],
            paymentStatus: PaymentStatus.UNPAID,
            review: null,
            respondedAt: null
        }));

        await this._customerRepository.updateProfile(customerId, {
            phone: data.phoneNumber,
            location: data.location
        });

        if (!bookingDoc) {
            this.logger.error('Failed to create new booking.');
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }

        await this._slotUtility.reserve(slotData.ruleId, slotData.date, slotData.from, slotData.to);
        await this._customerRepository.changeReviewStatus(customerId, false);

        return {
            success: true,
            message: 'Service booked successfully.',
            data: this._bookingMapper.toEntity(bookingDoc)
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

        const provider = await this._providerRepository.findById(booking.providerId.toString());
        if (!provider) {
            throw new InternalServerErrorException(`Provider with ID ${booking.providerId} not found.`);
        }

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
                phone: provider.phone
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

        const services = await Promise.all(
            updatedBooking.services.map(async (s) => {
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

        const services = await Promise.all(
            updatedBooking.services.map(async (s) => {
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

        // let transaction: ITransaction | null = await this._getTransactionData(updatedBooking.transactionId?.toString());

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
            success: !hasOngoingBooking,
            message: hasOngoingBooking ? "OK to call" : 'No ongoing booking found.'
        }
    }
}