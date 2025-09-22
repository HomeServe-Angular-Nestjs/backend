import { IEntity } from "@core/entities/base/interfaces/base-entity.entity.interface";

export interface IAdminSettings extends IEntity {
    gstPercentage: number;
    providerCommission: number;
    customerCommission: number;
}