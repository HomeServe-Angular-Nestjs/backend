import { ADMIN_SETTINGS_MAPPER } from "@core/constants/mappers.constant";
import { ADMIN_SETTINGS_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { IAdminSettingMapper } from "@core/dto-mapper/interface/admin-setting.mapper.interface";
import { IAdminSettings } from "@core/entities/interfaces/admin-settings.entity.interface";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";
import { IResponse } from "@core/misc/response.util";
import { IAdminSettingsRepository } from "@core/repositories/interfaces/admin-settings-repo.interface";
import { IAdminSettingService } from "@modules/users/services/interfaces/settings-service.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class AdminSettingService implements IAdminSettingService {

    constructor(
        @Inject(ADMIN_SETTINGS_REPOSITORY_NAME)
        private readonly _settingsRepository: IAdminSettingsRepository,
        @Inject(ADMIN_SETTINGS_MAPPER)
        private readonly _adminSettingMapper: IAdminSettingMapper
    ) { }

    async getSettings(): Promise<IResponse<IAdminSettings>> {
        const settingDoc = await this._settingsRepository.getSettings();

        if (!settingDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: ErrorMessage.DOCUMENT_NOT_FOUND
        });

        return {
            success: true,
            message: 'settings fetched successfully',
            data: this._adminSettingMapper.toEntity(settingDoc)
        }
    }

    async updateSetting(setting: IAdminSettings): Promise<IResponse<IAdminSettings>> {
        const updatedSettingDoc = await this._settingsRepository.updateSettings(setting);
        return {
            success: true,
            message: 'Settings updated successfully.',
            data: this._adminSettingMapper.toEntity(updatedSettingDoc)
        }
    }
}