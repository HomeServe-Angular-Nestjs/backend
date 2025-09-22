import { IAdminSettings } from "@core/entities/interfaces/admin-settings.entity.interface";
import { IResponse } from "@core/misc/response.util";

export interface IAdminSettingService {
    getSettings(): Promise<IResponse<IAdminSettings>>;
    updateSetting(setting: IAdminSettings): Promise<IResponse<IAdminSettings>>;
}