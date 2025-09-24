import { ADMIN_SETTINGS_SERVICE_NAME } from "@core/constants/service.constant";
import { IAdminSettings } from "@core/entities/interfaces/admin-settings.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { SettingsDto } from "@modules/users/dtos/admin-user.dto";
import { IAdminSettingService } from "@modules/users/services/interfaces/settings-service.interface";
import { Body, Controller, Get, Inject, Patch } from "@nestjs/common";

@Controller('admin/settings')
export class AdminSettingsController {
    constructor(
        @Inject(ADMIN_SETTINGS_SERVICE_NAME)
        private readonly _settingService: IAdminSettingService
    ) { }

    @Get('')
    async fetchSettings(): Promise<IResponse<IAdminSettings>> {
        return await this._settingService.getSettings();
    }

    @Patch('')
    async updateSettings(@Body() body: SettingsDto): Promise<IResponse<IAdminSettings>> {
        const data = Object.fromEntries(
            Object.entries(body).filter(([_, value]) => value !== undefined)
        );
        return await this._settingService.updateSetting(data as IAdminSettings);
    }
}