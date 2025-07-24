import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, Search } from "@nestjs/common";
import { IProviderBookingService } from "../interfaces/provider-booking-service.interface";
import { BOOKING_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, SERVICE_OFFERED_REPOSITORY_NAME, TRANSACTION_REPOSITORY_NAME } from "../../../../core/constants/repository.constant";
import { IBookingRepository } from "../../../../core/repositories/interfaces/bookings-repo.interface";
import { IServiceOfferedRepository } from "../../../../core/repositories/interfaces/serviceOffered-repo.interface";
import { ICustomerRepository } from "../../../../core/repositories/interfaces/customer-repo.interface";
import { IBookingDetailProvider, IBookingOverviewChanges, IBookingOverviewData, IProviderBookingLists, IResponseProviderBookingLists } from "../../../../core/entities/interfaces/booking.entity.interface";
import { FilterFields, UpdateBookingStatusDto } from "../../dtos/booking.dto";
import { BookingStatus, CancelStatus, DateRange, PaymentStatus } from "src/core/enum/bookings.enum";
import { ITransactionRepository } from "src/core/repositories/interfaces/transaction-repo.interface";
import { IResponse } from "src/core/misc/response.util";
import { CustomLogger } from "src/core/logger/custom-logger";

@Injectable()
export class ProviderBookingService implements IProviderBookingService {
    private logger = new CustomLogger(ProviderBookingService.name);

    constructor(
        @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
        private readonly _serviceOfferedRepository: IServiceOfferedRepository,
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(TRANSACTION_REPOSITORY_NAME)
        private readonly _transactionRepository: ITransactionRepository,
    ) { }


    async fetchBookingsList(id: string, page: number = 1, filters: FilterFields): Promise<IResponseProviderBookingLists> {
        const limit = 5;
        const skip = (page - 1) * limit;

        const rawBookings = await this._bookingRepository.find({ providerId: id });
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
                    cancelStatus: booking.cancelStatus,
                    bookingStatus: booking.bookingStatus,
                };
            })
        );

        let filteredBookings = enrichBookings;

        // Filter by search
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

        // Filter by bookingStatus
        if (filters.bookingStatus) {
            filteredBookings = filteredBookings.filter(
                (booking) => booking.bookingStatus === filters.bookingStatus
            );
        }

        // Filter by paymentStatus
        if (filters.paymentStatus) {
            filteredBookings = filteredBookings.filter(
                (booking) => booking.paymentStatus === filters.paymentStatus
            );
        }

        if (filters.date) {
            const today = new Date();

            filteredBookings = filteredBookings.filter((booking) => {
                const expectedArrivalTime = new Date(booking.expectedArrivalTime);

                switch (filters.date) {
                    case DateRange.TODAY:
                        return expectedArrivalTime.toDateString() === today.toDateString();
                    case DateRange.THIS_WEEK: {
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDate());
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        return expectedArrivalTime >= weekStart && expectedArrivalTime <= weekEnd;
                    }
                    case DateRange.THIS_MONTH:
                        return expectedArrivalTime.getMonth() === today.getMonth() &&
                            expectedArrivalTime.getFullYear() === today.getFullYear();
                    case DateRange.THIS_YEAR:
                        return expectedArrivalTime.getFullYear() === today.getFullYear();
                    default:
                        return true;
                }
            });

        }

        const total = filteredBookings.length;
        const paginated = filteredBookings.slice(skip, skip + limit);

        return {
            bookingData: paginated,
            paginationData: { page, limit, total }
        }
    }

    async fetchOverviewData(id: string): Promise<IBookingOverviewData> {
        const bookings = await this._bookingRepository.find({ providerId: id });
        const now = new Date();

        const getMonthRange = (date: Date) => ({
            start: new Date(date.getFullYear(), date.getMonth(), 1),
            end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999),
        });

        // Date ranges for current and last month
        const thisMonthRange = getMonthRange(now);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthRange = getMonthRange(lastMonthDate);

        // Filter bookings by month with safety check for createdAt
        const bookingsThisMonth = bookings.filter(
            b => b.createdAt !== undefined &&
                b.createdAt >= thisMonthRange.start && b.createdAt <= thisMonthRange.end
        );

        const bookingsLastMonth = bookings.filter(
            b => b.createdAt !== undefined &&
                b.createdAt >= lastMonthRange.start && b.createdAt <= lastMonthRange.end
        );

        // Function to calculate summary counts
        const summarize = (list: typeof bookings) =>
            list.reduce(
                (acc, b) => {
                    if (b.bookingStatus === BookingStatus.PENDING) acc.pendingRequests++;
                    if (b.bookingStatus === BookingStatus.COMPLETED) acc.completedJobs++;
                    if (b.paymentStatus === PaymentStatus.UNPAID) acc.pendingPayments++;
                    if (b.bookingStatus === BookingStatus.CANCELLED) acc.cancelledBookings++;
                    return acc;
                },
                {
                    pendingRequests: 0,
                    completedJobs: 0,
                    pendingPayments: 0,
                    cancelledBookings: 0,
                }
            );

        // Calculate summaries for this and last month
        const summaryThisMonth = summarize(bookingsThisMonth);
        const summaryLastMonth = summarize(bookingsLastMonth);

        // Total bookings for each month
        const totalThisMonth = bookingsThisMonth.length;
        const totalLastMonth = bookingsLastMonth.length;

        // Helper for percentage calculation with safe zero check
        const calcPercentChange = (current: number, previous: number): number => {
            if (previous === 0) {
                return current === 0 ? 0 : 100;
            }
            return ((current - previous) / previous) * 100;
        };

        // Calculate percentage changes with correct property names matching IBookingOverviewChanges interface
        const changes: IBookingOverviewChanges = {
            totalBookingsChange: calcPercentChange(totalThisMonth, totalLastMonth),
            pendingRequestsChange: calcPercentChange(summaryThisMonth.pendingRequests, summaryLastMonth.pendingRequests),
            completedJobsChange: calcPercentChange(summaryThisMonth.completedJobs, summaryLastMonth.completedJobs),
            pendingPaymentsChange: calcPercentChange(summaryThisMonth.pendingPayments, summaryLastMonth.pendingPayments),
            cancelledBookingsChange: calcPercentChange(summaryThisMonth.cancelledBookings, summaryLastMonth.cancelledBookings),
        };

        return {
            ...summaryThisMonth,
            totalBookings: totalThisMonth,
            changes,
        };
    }

    async fetchBookingDetails(bookingId: string): Promise<IBookingDetailProvider> {
        const booking = await this._bookingRepository.findById(bookingId);
        if (!booking) {
            throw new InternalServerErrorException(`Booking with ID ${bookingId} not found.`);
        }

        const customer = await this._customerRepository.findById(booking.customerId);
        if (!customer) {
            throw new InternalServerErrorException(`Provider with ID ${booking.customerId} not found.`);
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
            cancelStatus: booking.cancelStatus,
            cancelReason: booking.cancellationReason,
            cancelledAt: booking.cancelledAt,
            customer: {
                name: customer.fullname || customer.username,
                email: customer.email,
                phone: customer.phone,
                location: booking.location.address,
            },
            orderedServices,
            transaction: transaction ? {
                id: transaction.id,
                paymentDate: transaction.createdAt as Date,
                paymentMethod: transaction.method as string
            } : null
        }
    }

    async updateBookingStatus(dto: UpdateBookingStatusDto): Promise<IResponse<IBookingDetailProvider>> {
        try {
            const updateData: Record<string, string | Date> = {
                bookingStatus: dto.newStatus
            }

            if (dto.newStatus === 'cancelled') {
                updateData.cancelStatus = 'cancelled';
                updateData.paymentStatus = 'refunded';
                updateData.cancelledAt = new Date();
            }

            const updatedBooking = await this._bookingRepository.findOneAndUpdate(
                { _id: dto.bookingId },
                { $set: updateData },
                { new: true }
            );

            if (!updatedBooking) {
                throw new NotFoundException(`Booking with ID ${dto.bookingId} not found.`);
            }

            const customer = await this._customerRepository.findById(updatedBooking.customerId);
            if (!customer) {
                throw new InternalServerErrorException(`Provider with ID ${updatedBooking.customerId} not found.`);
            }


            const orderedServices = (
                await Promise.all(
                    updatedBooking.services.map(async (s) => {
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

            const transaction = await this._transactionRepository.findById(updatedBooking.transactionId ?? '');

            const updateDate: IBookingDetailProvider = {
                bookingId: updatedBooking.id,
                bookingStatus: updatedBooking.bookingStatus,
                paymentStatus: updatedBooking.paymentStatus,
                createdAt: updatedBooking.createdAt as Date,
                expectedArrivalTime: updatedBooking.expectedArrivalTime,
                totalAmount: updatedBooking.totalAmount,
                cancelStatus: updatedBooking.cancelStatus,
                cancelReason: updatedBooking.cancellationReason,
                cancelledAt: updatedBooking.cancelledAt,
                customer: {
                    name: customer.fullname || customer.username,
                    email: customer.email,
                    phone: customer.phone,
                    location: updatedBooking.location.address,
                },
                orderedServices,
                transaction: transaction ? {
                    id: transaction.id,
                    paymentDate: transaction.createdAt as Date,
                    paymentMethod: transaction.method as string
                } : null
            }

            return {
                success: true,
                message: 'Status updated successfully',
                data: updateDate
            };
        } catch (err) {
            this.logger.error('Error updating booking status:', err);
            throw new InternalServerErrorException('Failed to update booking status.');
        }
    }

}
