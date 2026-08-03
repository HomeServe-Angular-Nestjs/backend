import { CHAT_REPOSITORY_INTERFACE_NAME, BOOKING_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ErrorCodes } from "@core/enum/error.enum";
import { IPayload } from "@core/misc/payload.interface";
import { IChatRepository } from "@core/repositories/interfaces/chat-repo.interface";
import { IBookingRepository } from "@core/repositories/interfaces/bookings-repo.interface";
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class CallOrChatAccessGuard implements CanActivate {
    constructor(
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(CHAT_REPOSITORY_INTERFACE_NAME)
        private readonly _chatRepository: IChatRepository,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const user = req.user as IPayload;
        const receiverId = req.query.receiverId;

        let customerId: string | null = null;
        let providerId: string | null = null;

        if (user.type === 'customer') {
            customerId = user.sub;
            providerId = receiverId;
        }

        if (user.type === 'provider') {
            providerId = user.sub;
            customerId = receiverId;
        }

        if (!customerId || !providerId) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: 'customer id or provider id is missing',
        })

        const isBookingOngoing = await this._bookingRepository.isAnyBookingOngoing(customerId, providerId);

        if (isBookingOngoing) {
            return true;
        }

        const existingChat = await this._chatRepository.findChatBetweenParticipants(
            { id: new Types.ObjectId(customerId), type: 'customer' },
            { id: new Types.ObjectId(providerId), type: 'provider' },
        );

        if (existingChat) {
            return true;
        }

        throw new ForbiddenException({
            code: ErrorCodes.NO_ACTIVE_BOOKINGS,
            message: 'You can only call or chat during an active booking.',
        });
    }
}
