import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { BookedSlotDocument } from "@core/schema/booked-slot.schema";

export interface IBookedSlotRepository extends IBaseRepository<BookedSlotDocument> {
    findBookedSlots(ruleId: string): Promise<BookedSlotDocument[]>;
    isAlreadyBooked(ruleId: string): Promise<boolean>;
}