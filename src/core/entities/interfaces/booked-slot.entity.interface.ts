import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";
import { SlotStatusEnum } from "@core/enum/slot.enum";

export interface IBookedSlot extends IEntity {
    providerId: string;
    ruleId: string;
    date: Date;
    from: string;
    to: string;
    status: SlotStatusEnum;
}