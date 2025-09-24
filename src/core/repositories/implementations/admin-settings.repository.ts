import { ADMIN_SETTINGS_MODEL_NAME } from "@core/constants/model.constant";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";
import { ICustomLogger } from "@core/logger/interface/custom-logger.interface";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { IAdminSettingsRepository } from "@core/repositories/interfaces/admin-settings-repo.interface";
import { AdminSettingsDocument } from "@core/schema/admin-settings.schema";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class AdminSettingsRepository implements IAdminSettingsRepository {
    private readonly logger: ICustomLogger;

    constructor(
        @InjectModel(ADMIN_SETTINGS_MODEL_NAME)
        private readonly _settingsModel: Model<AdminSettingsDocument>,
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
    ) {
        this.logger = this._loggerFactory.createLogger(AdminSettingsRepository.name);
    }

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

    async getTax(): Promise<number> {
        const settings = await this._settingsModel.findOne().lean().exec();
        if (!settings || typeof settings.gstPercentage !== 'number') {
            this.logger.error('Failed to get settings or invalid GST value.');
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Failed to calculate the tax.'
            });
        }

        return settings.gstPercentage;
    }

    async getCustomerCommission(): Promise<number> {
        const settings = await this._settingsModel.findOne().lean().exec();
        if (!settings || typeof settings.customerCommission !== 'number') {
            this.logger.error('Failed to get settings or invalid customer commission value.');
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Failed to calculate the fee.'
            });
        }

        return settings.customerCommission;
    }

    async getProviderCommission(): Promise<number> {
        const settings = await this._settingsModel.findOne().lean().exec();
        if (!settings || typeof settings.providerCommission !== 'number') {
            this.logger.error('Failed to get settings or invalid customer commission value.');
            throw new NotFoundException({
                code: ErrorCodes.NOT_FOUND,
                message: 'Failed to calculate the fee.'
            });
        }

        return settings.providerCommission;
    }
}