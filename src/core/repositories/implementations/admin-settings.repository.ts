import { ADMIN_SETTINGS_MODEL_NAME } from "@core/constants/model.constant";
import { IAdminSettingsRepository } from "@core/repositories/interfaces/admin-settings-repo.interface";
import { AdminSettingsDocument } from "@core/schema/admin-settings.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class AdminSettingsRepository implements IAdminSettingsRepository {
    constructor(
        @InjectModel(ADMIN_SETTINGS_MODEL_NAME)
        private readonly _settingsModel: Model<AdminSettingsDocument>,
    ) { }

    async getSettings(): Promise<AdminSettingsDocument> {
        let settings = await this._settingsModel.findOne().exec();

        if (!settings) {
            const created = new this._settingsModel();
            settings = await created.save();
        }

        return settings;
    }

    async updateSettings(update: Partial<AdminSettingsDocument>): Promise<AdminSettingsDocument> {
        return this._settingsModel.findOneAndUpdate(
            {},
            { $set: update },
            { new: true, upsert: true })
            .lean().exec();
    }
}