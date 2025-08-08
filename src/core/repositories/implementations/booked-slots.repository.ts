import { BOOKED_SLOT_MODEL_NAME } from "@core/constants/model.constant";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { IBookedSlotRepository } from "@core/repositories/interfaces/booked-slot-repo.interface";
import { BookedSlotDocument } from "@core/schema/booked-slot.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

@Injectable()
export class BookedSlotsRepository extends BaseRepository<BookedSlotDocument> implements IBookedSlotRepository {

    constructor(
        @InjectModel(BOOKED_SLOT_MODEL_NAME)
        private readonly _bookedSlotModel: Model<BookedSlotDocument>
    ) {
        super(_bookedSlotModel);
    }

    async findBookedSlots(ruleId: string): Promise<BookedSlotDocument[]> {
        return await this._bookedSlotModel.find({ ruleId }).lean().exec();
    }

    async isAlreadyBooked(ruleId: string): Promise<boolean> {
        return !!(await this._bookedSlotModel.exists({ ruleId: this._toObjectId(ruleId) }));
    }
}