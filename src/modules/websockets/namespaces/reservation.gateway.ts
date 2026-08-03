import { AUTH_SOCKET_SERVICE_NAME, RESERVATION_SERVICE_NAME, USER_SOCKET_STORE_SERVICE_NAME } from "@core/constants/service.constant";
import { BOOKING_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { CUSTOM_DTO_VALIDATOR_NAME } from "@core/constants/utility.constant";
import { ErrorMessage } from "@core/enum/error.enum";
import { GlobalWsExceptionFilter } from "@core/exception-filters/ws-exception.filters";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { IBookingRepository } from "@core/repositories/interfaces/bookings-repo.interface";
import { ICustomDtoValidator } from "@core/utilities/interface/custom-dto-validator.utility.interface";
import { SendReservationDto } from "@modules/websockets/dto/reservation.dto";
import { BaseSocketGateway, corsOption } from "@modules/websockets/namespaces/base.gateway";
import { IAuthSocketService } from "@modules/websockets/services/interface/auth-socket-service.interface";
import { IReservationService } from "@modules/websockets/services/interface/reservation-service.interface";
import { IUserSocketStoreService } from "@modules/websockets/services/interface/user-socket-store-service.interface";
import { Inject, InternalServerErrorException, UseFilters } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { fromEventPattern } from "rxjs";
import { Server, Socket } from "socket.io";

const namespace = 'reservation';
const CREATE_RESERVATION = 'reservation:create';
const CHECK_RESERVATION = 'reservation:check';
const RELEASE_RESERVATION = 'reservation:release';
const NEW_RESERVATION = 'reservation:new';
const INFORM_RESERVATION = 'reservation:inform';
const IS_RESERVED = 'reservation:reserved';
const RESERVATION_ERROR = 'reservation:error';
const JOIN_PROVIDER_ROOM = 'provider_room:join';
const LEAVE_PROVIDER_ROOM = 'provider_room:leave';

@UseFilters(GlobalWsExceptionFilter)
@WebSocketGateway({ cors: corsOption, namespace })
export class ReservationGateway extends BaseSocketGateway {
    @WebSocketServer()
    private server: Server;

    constructor(
        @Inject(LOGGER_FACTORY)
        loggerFactory: ILoggerFactory,
        @Inject(AUTH_SOCKET_SERVICE_NAME)
        authSocketService: IAuthSocketService,
        @Inject(USER_SOCKET_STORE_SERVICE_NAME)
        userSocketService: IUserSocketStoreService,
        @Inject(CUSTOM_DTO_VALIDATOR_NAME)
        private readonly _customDtoValidatorUtility: ICustomDtoValidator,
        @Inject(RESERVATION_SERVICE_NAME)
        private readonly _reservationService: IReservationService,
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
    ) {
        super(loggerFactory, authSocketService, userSocketService, namespace);
    }

    protected override async onClientConnect(client: Socket): Promise<void> {
        await this._authenticate(client);
    }

    protected override async onClientDisConnect(client: Socket): Promise<void> {
        await this._unauthenticate(client);
    }

    @SubscribeMessage(CHECK_RESERVATION)
    async handleNewReservation(@ConnectedSocket() client: Socket, @MessageBody() body: SendReservationDto) {
        await this._customDtoValidatorUtility.validateDto(SendReservationDto, body);

        const isReserved = await this._reservationService.isReserved(body.providerId, body.from, body.to, body.date);

        if (isReserved) {
            client.emit(IS_RESERVED, {
                from: body.from,
                to: body.to,
                date: body.date
            });
        }
    }

    @SubscribeMessage(CREATE_RESERVATION)
    async createNewReservation(@ConnectedSocket() client: Socket, @MessageBody() body: SendReservationDto) {
        try {
            await this._customDtoValidatorUtility.validateDto(SendReservationDto, body);
            const user = this._getClient(client);

            const existingBookings = await this._bookingRepository.findAllBookingsByProviderOnSameDate(body.providerId, body.date);
            const hasBookingConflict = existingBookings.some(booking =>
                this._isSlotConflict(body.from, body.to, booking.slot.from, booking.slot.to)
            );

            if (hasBookingConflict) {
                client.emit(IS_RESERVED, {
                    from: body.from,
                    to: body.to,
                    date: body.date
                });
                return;
            }

            const newReservation = await this._reservationService.createReservation({
                from: body.from,
                to: body.to,
                date: body.date,
                providerId: body.providerId,
                customerId: user.id
            });

            if (!newReservation) throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);

            client.emit(NEW_RESERVATION, newReservation);
            this.server.to(body.providerId).emit(INFORM_RESERVATION, {
                from: body.from,
                to: body.to,
                date: body.date
            });
        } catch (error) {
            this.logger.error(`Failed to create reservation: ${error.message}`);
            if (error.code === 11000 || error.message?.includes('E11000')) {
                client.emit(IS_RESERVED, {
                    from: body.from,
                    to: body.to,
                    date: body.date
                });
            } else {
                client.emit(RESERVATION_ERROR, { message: ErrorMessage.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @SubscribeMessage(RELEASE_RESERVATION)
    async releaseReservation(@ConnectedSocket() client: Socket, @MessageBody() body: SendReservationDto) {
        try {
            await this._customDtoValidatorUtility.validateDto(SendReservationDto, body);
            const user = this._getClient(client);

            const result = await this._reservationService.releaseReservation(body.providerId, body.from, body.to, body.date);
            this.logger.debug(`Released reservation for user ${user.id}: ${body.from}-${body.to} on ${body.date}`);
            if (result.deletedCount && result.deletedCount > 0) {
                this.server.to(body.providerId).emit(INFORM_RESERVATION, {
                    from: body.from,
                    to: body.to,
                    date: body.date
                });
            }
        } catch (error) {
            this.logger.error(`Failed to release reservation: ${error.message}`);
            client.emit(RESERVATION_ERROR, { message: ErrorMessage.INTERNAL_SERVER_ERROR });
        }
    }

    private _isSlotConflict(newFrom: string, newTo: string, existingFrom: string, existingTo: string): boolean {
        const toMinutes = (time: string): number => {
            const [hours, minutes] = time.split(':').map(Number);
            return (hours * 60) + (minutes || 0);
        };

        let newStart = toMinutes(newFrom);
        let newEnd = toMinutes(newTo);
        let existingStart = toMinutes(existingFrom);
        let existingEnd = toMinutes(existingTo);

        // handle overnight slots
        if (newEnd <= newStart) newEnd += 1440;
        if (existingEnd <= existingStart) existingEnd += 1440;

        return newStart < existingEnd && newEnd > existingStart;
    }

    @SubscribeMessage(JOIN_PROVIDER_ROOM)
    async joinProviderRoom(@ConnectedSocket() client: Socket, @MessageBody() providerId: string) {
        this.logger.debug(`Joining provider room: ${providerId}`);
        const user = this._getClient(client);
        if (!providerId || !user?.id) return;
        await this._userSocketService.addToProviderRoom(providerId, user.id);
        client.join(providerId);
    }

    @SubscribeMessage(LEAVE_PROVIDER_ROOM)
    async leaveProviderRoom(@ConnectedSocket() client: Socket, @MessageBody() providerId: string) {
        this.logger.debug(`Leaving provider room: ${providerId}`);
        const user = this._getClient(client);
        if (!providerId || !user?.id) return;
        await this._userSocketService.removeFromProviderRoom(providerId, user.id);
    }

}