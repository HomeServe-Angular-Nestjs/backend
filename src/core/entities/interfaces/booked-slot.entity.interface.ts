import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";

export interface IBookedSlot extends IEntity {
    providerId: string;
    ruleId: string;
    from: string;
    to: string;
}