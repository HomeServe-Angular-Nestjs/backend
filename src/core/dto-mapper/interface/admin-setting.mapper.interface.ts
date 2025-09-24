import { IAdminSettings } from "@core/entities/interfaces/admin-settings.entity.interface"
import { AdminSettingsDocument } from "@core/schema/admin-settings.schema"

export interface IAdminSettingMapper {
    toEntity(doc: AdminSettingsDocument): IAdminSettings
    toDocument(entity: IAdminSettings): Partial<AdminSettingsDocument>
}