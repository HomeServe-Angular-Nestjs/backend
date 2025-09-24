import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SERVICE_OFFERED_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { IBooking, IBookingDetailCustomer, IBookingResponse, IBookingWithPagination } from '@core/entities/interfaces/booking.entity.interface';
import { BookingStatus, PaymentStatus } from '@core/enum/bookings.enum';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { IResponse } from '@core/misc/response.util';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { IServiceOfferedRepository } from '@core/repositories/interfaces/serviceOffered-repo.interface';
import { ITransactionRepository } from '@core/repositories/interfaces/transaction-repo.interface';
import { BookingDto, CancelBookingDto, SelectedServiceDto, UpdateBookingDto, UpdateBookingPaymentStatusDto } from '@modules/bookings/dtos/booking.dto';
import { IBookingService } from '@modules/bookings/services/interfaces/booking-service.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { SlotStatusEnum } from '@core/enum/slot.enum';
import { IBookingMapper } from '@core/dto-mapper/interface/bookings.mapper.interface';
import { BOOKING_MAPPER, TRANSACTION_MAPPER } from '@core/constants/mappers.constant';
import { ITransactionMapper } from '@core/dto-mapper/interface/transaction.mapper.interface';
import { ITransaction } from '@core/entities/interfaces/transaction.entity.interface';
import { PRICING_UTILITY_NAME, SLOT_UTILITY_NAME, TIME_UTILITY_NAME } from '@core/constants/utility.constant';
import { IPricingBreakup, IPricingUtility } from '@core/utilities/interface/pricing.utility.interface';
import { ISlotUtility } from '@core/utilities/interface/slot.utility.interface';
import { ITimeUtility } from '@core/utilities/interface/time.utility.interface';
import { IWalletRepository } from '@core/repositories/interfaces/wallet-repo.interface';

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
    ) {
        this.logger = this._loggerFactor.createLogger(BookingService.name);
    }

    private async _getTransactionData(txId?: string | null): Promise<ITransaction | null> {
        if (!txId) return null;

        const txDoc = await this._transactionRepository.findTransactionById(txId);
        if (!txDoc) {
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Transaction document not found'
            });
        }

        return this._transactionMapper.toEntity(txDoc);
    }

    // Calculates the detailed price breakup for a list of selected services and subServices.
    async preparePriceBreakup(dto: SelectedServiceDto[]): Promise<IPricingBreakup> {
        const subServiceIds = dto.flatMap(ids => ids.subServiceIds);
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
        const { slotData } = data;

        const isAvailable = await this._slotUtility.isAvailable(
            slotData.ruleId,
            slotData.date,
            slotData.from,
            slotData.to
        );

        if (!isAvailable) {
            return {
                success: false,
                message: 'Slot is already booked.'
            };
        }
        const expectedArrivalTime = this._timeUtility.combineLocalDateAndTimeUTC(slotData.date, slotData.from);

        const bookingDoc = await this._bookingRepository.create(this._bookingMapper.toDocument({
            customerId,
            providerId: data.providerId,
            totalAmount: data.total,
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
            transactionId: data.transactionId,
            paymentStatus: data.transactionId ? PaymentStatus.PAID : PaymentStatus.UNPAID,
        }));

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

    async fetchBookings(id: string, page: number = 1): Promise<IBookingWithPagination> {
        const limit = 4;
        const skip = (page - 1) * limit;

        const total = await this._bookingRepository.countDocumentsByCustomer(id);
        if (!total) return { bookingData: [], paginationData: { total: 0, page, limit } };

        const bookingDocs = await this._bookingRepository.findBookingsByCustomerIdWithPagination(id, skip, limit);

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

                let transaction: ITransaction | null = await this._getTransactionData(booking.transactionId);

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
                    totalAmount: booking.totalAmount,
                    createdAt: booking.createdAt as Date,
                    transaction: transaction ? {
                        transactionId: transaction.id,
                        paymentSource: transaction.source
                    } : null
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
        const booking = await this._bookingRepository.findById(bookingId);
        if (!booking) {
            throw new InternalServerErrorException(`Booking with ID ${bookingId} not found.`);
        }

        const provider = await this._providerRepository.findById(booking.providerId.toString());
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
                paymentDate: transaction.createdAt as Date,
                paymentMethod: transaction.direction as string
            } : null
        }
    }

    async cancelBooking(dto: CancelBookingDto): Promise<IResponse> {
        const bookingDoc = await this._bookingRepository.findById(dto.bookingId);
        if (!bookingDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: ErrorMessage.DOCUMENT_NOT_FOUND
        });

        const booking = this._bookingMapper.toEntity(bookingDoc);

        if (booking.bookingStatus === BookingStatus.CANCELLED) {
            throw new ConflictException({
                code: ErrorCodes.CONFLICT,
                message: 'Booking is already cancelled.'
            });
        }

        const bookingDate = new Date(booking.createdAt ?? 0);
        const now = new Date();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        const isWithin24Hours = (now.getTime() - bookingDate.getTime()) <= TWENTY_FOUR_HOURS;

        if (!isWithin24Hours) throw new ConflictException({
            code: ErrorCodes.CONFLICT,
            message: 'Cancellation is allowed only within 24 hours of booking.'
        });

        const updatedBooking = await this._bookingRepository.cancelBooking(booking.id, dto.reason);

        if (!updatedBooking) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: ErrorMessage.DOCUMENT_NOT_FOUND
        });

        const cancelledAmount = updatedBooking.totalAmount * 100;
        console.log(cancelledAmount)
        await Promise.all([
            this._walletRepository.updateAdminAmount(-cancelledAmount),
            this._walletRepository.updateUserAmount(booking.customerId, 'customer', cancelledAmount)
        ]);

        return {
            success: true,
            message: 'Booking cancelled successfully'
        }
    }

    async updateBooking(dto: UpdateBookingDto): Promise<IResponse<IBookingResponse>> {
        const updatedBooking = await this._bookingRepository.findOneAndUpdate(
            { _id: dto.bookingId },
            {
                $set: {
                    transactionId: dto.transactionId ?? null,
                    paymentStatus: dto.transactionId ? PaymentStatus.PAID : PaymentStatus.UNPAID,
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

        let transaction: ITransaction | null = await this._getTransactionData(updatedBooking.transactionId?.toString());

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
            totalAmount: updatedBooking.totalAmount,
            transaction: transaction ? {
                transactionId: transaction.id,
                paymentSource: transaction.source
            } : null
        }

        return {
            success: true,
            message: 'Successfully booked the service',
            data: updatedData
        }
    }

    async updateBookingPaymentStatus(dto: UpdateBookingPaymentStatusDto): Promise<IResponse<boolean>> {
        const result = await this._bookingRepository.updatePaymentStatus(
            dto.bookingId,
            dto.paymentStatus,
            dto.transactionId
        );

        return {
            success: !!result,
            message: !!result ? 'Status updated successfully' : 'failed to update status',
            data: !!result
        }
    }

}
