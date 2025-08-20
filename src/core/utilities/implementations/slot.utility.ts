import { BOOKING_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";
import { SlotStatusEnum } from "@core/enum/slot.enum";
import { IBookingRepository } from "@core/repositories/interfaces/bookings-repo.interface";
import { ISlotUtility } from "@core/utilities/interface/slot.utility.interface";
import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class SlotUtility implements ISlotUtility {

    constructor(
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository
    ) { }

    private async _updateSlotStatus(ruleId: string, dateISO: string, from: string, to: string, status: SlotStatusEnum): Promise<void> {
        const updated = await this._bookingRepository.updateSlotStatus(ruleId, from, to, dateISO, status);
        if (!updated) {
            throw new InternalServerErrorException({
                code: ErrorCodes.DATABASE_OPERATION_FAILED,
                message: ErrorMessage.SLOT_RESERVATION_FAILED
            });
        }
    }

    async isAvailable(ruleId: string, dateISO: string, from: string, to: string): Promise<boolean> {
        const alreadyBooked = await this._bookingRepository.isAlreadyBooked(ruleId, from, to, dateISO);
        return !alreadyBooked;
    }

    async reserve(ruleId: string, dateISO: string, from: string, to: string,): Promise<void> {
        await this._updateSlotStatus(ruleId, from, to, dateISO, SlotStatusEnum.PENDING);
    }

    async release(ruleId: string, dateISO: string, from: string, to: string): Promise<void> {
        await this._updateSlotStatus(ruleId, from, to, dateISO, SlotStatusEnum.AVAILABLE);
    }

    async complete(ruleId: string, dateISO: string, from: string, to: string): Promise<void> {
        await this._updateSlotStatus(ruleId, from, to, dateISO, SlotStatusEnum.COMPLETED);
    }

    async cancel(ruleId: string, dateISO: string, from: string, to: string): Promise<void> {
        await this._updateSlotStatus(ruleId, from, to, dateISO, SlotStatusEnum.CANCELLED);
    }
}