import { IBookedSlotMapper } from "@core/dto-mapper/interface/booked-slots.mapper.interface";
import { BookedSlot } from "@core/entities/implementation/booked-slot.entity";
import { IBookedSlot } from "@core/entities/interfaces/booked-slot.entity.interface";
import { BookedSlotDocument } from "@core/schema/booked-slot.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class BookedSlotMapper implements IBookedSlotMapper {
    toEntity(doc: BookedSlotDocument): IBookedSlot {
        return new BookedSlot({
            id: (doc._id as Types.ObjectId).toString(),
            providerId: doc.providerId.toString(),
            ruleId: doc.ruleId.toString(),
            from: doc.from,
            to: doc.to,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}