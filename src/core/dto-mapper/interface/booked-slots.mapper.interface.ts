import { IBookedSlot } from "@core/entities/interfaces/booked-slot.entity.interface";
import { BookedSlotDocument } from "@core/schema/booked-slot.schema";

export interface IBookedSlotMapper {
    toEntity(doc: BookedSlotDocument): IBookedSlot;
}