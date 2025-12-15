import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { IAdminSettings } from "@core/entities/interfaces/admin-settings.entity.interface";

export class AdminSettings extends BaseEntity implements IAdminSettings {
    gstPercentage: number;
    providerCommission: number;
    customerCommission: number;
    cancellationFee: number;
    providerCancellationFine: number;

    constructor(partial: Partial<IAdminSettings>) {
        super(partial);
        Object.assign(this, partial);
    }
}