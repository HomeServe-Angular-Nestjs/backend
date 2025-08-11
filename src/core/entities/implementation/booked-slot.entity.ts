import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { IBookedSlot } from "@core/entities/interfaces/booked-slot.entity.interface";
import { SlotStatusEnum } from "@core/enum/slot.enum";

export class BookedSlot extends BaseEntity implements IBookedSlot {
    providerId: string;
    ruleId: string;
    date: Date;
    from: string;
    to: string;
    status: SlotStatusEnum;

    constructor(partial: Partial<BookedSlot>) {
        super(partial);
        Object.assign(this, partial);
    }
}