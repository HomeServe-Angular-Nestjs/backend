import { IAdminSettingMapper } from "@core/dto-mapper/interface/admin-setting.mapper.interface";
import { AdminSettings } from "@core/entities/implementation/admin-settings.entity";
import { IAdminSettings } from "@core/entities/interfaces/admin-settings.entity.interface";
import { AdminSettingsDocument } from "@core/schema/admin-settings.schema";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class AdminSettingsMapper implements IAdminSettingMapper {
    toEntity(doc: AdminSettingsDocument): IAdminSettings {
        return new AdminSettings({
            id: (doc._id as Types.ObjectId).toString(),
            gstPercentage: doc.gstPercentage,
            providerCommission: doc.providerCommission,
            customerCommission: doc.customerCommission,
            cancellationFee: doc.cancellationFee,
            providerCancellationFine: doc.providerCancellationFine,
        });
    }

    toDocument(entity: IAdminSettings): Partial<AdminSettingsDocument> {
        return {
            gstPercentage: entity.gstPercentage,
            providerCommission: entity.providerCommission,
            customerCommission: entity.customerCommission,
            cancellationFee: entity.cancellationFee,
            providerCancellationFine: entity.providerCancellationFine,
        }
    }
}