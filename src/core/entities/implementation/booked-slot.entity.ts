import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { IBookedSlot } from "@core/entities/interfaces/booked-slot.entity.interface";

export class BookedSlot extends BaseEntity implements IBookedSlot {
    providerId: string;
    ruleId: string;
    from: string;
    to: string;

    constructor(partial: Partial<BookedSlot>) {
        super(partial);
        Object.assign(this, partial);
    }
}